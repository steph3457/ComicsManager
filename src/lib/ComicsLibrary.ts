import * as path from "path";
import * as async from "async";
import { Issue } from "../entity/Issue";
import { Config } from "./Config";
import { Comic } from "../entity/Comic";
import { createConnection, ConnectionOptions, Connection } from "typeorm";
import { Publisher } from "../entity/Publisher";
import { ReadingStatus } from "../entity/ReadingStatus";
import { Repository } from "typeorm/repository/Repository";

export class ComicsLibrary {
    private jsonfile = require("jsonfile");
    private configFileName = "config.json";
    config: Config;
    private connection: Connection;
    private comicRepository: Repository<Comic>;
    private issueRepository: Repository<Issue>;
    private readingStatusRepository: Repository<ReadingStatus>;

    // depracated
    private comicsLibraryFileName = "comicsLibrary.json";
    comics: Comic[] = [];
    //

    constructor(fromJson: boolean) {
        this.config = new Config(
            this.jsonfile.readFileSync(this.configFileName, { throws: false })
        );
        if (fromJson) {
            this.loadLibraryFromJson();
        } else {
            this.openConnection();
        }
    }
    async openConnection() {
        this.connection = await createConnection();
        this.comicRepository = this.connection.getRepository(Comic);
        this.issueRepository = this.connection.getRepository(Issue);
        this.readingStatusRepository = this.connection.getRepository(
            ReadingStatus
        );
    }

    // depracated
    loadLibraryFromJson() {
        this.comics = [];
        const comicsLibrary = this.jsonfile.readFileSync(
            this.comicsLibraryFileName,
            { throws: false }
        );
        for (const comic in comicsLibrary) {
            this.comics[comic] = new Comic(comicsLibrary[comic]);
        }
    }
    //
    saveConfig(config: Config) {
        if (config) {
            this.config = config;
        }
        this.jsonfile.writeFileSync(this.configFileName, this.config, {
            spaces: 2
        });
    }

    private async analyseComicsFolderName(folderName: string) {
        let comic: Comic = await this.comicRepository.findOne({
            folder_name: folderName
        });
        if (comic) {
            return;
        }
        comic = new Comic(null);
        comic.folder_name = folderName;
        const folderNameSplitted = folderName.match(/(.*)\(([0-9]{4})\)$/);
        if (folderNameSplitted && folderNameSplitted.length === 3) {
            comic.title = folderNameSplitted[1].replace(/_/g, " ");
            comic.year = folderNameSplitted[2];
        } else {
            comic.title = folderName;
        }
        await this.comicRepository.save(comic);
    }
    async parseComics(res) {
        const fs = require("fs");
        const libraryPath = this.config.comicsPath;
        const comicList = fs.readdirSync(libraryPath);
        for (const index in comicList) {
            const comicFolder = comicList[index];
            const comicPath: string = path.resolve(libraryPath, comicFolder);
            const comicStat = fs.statSync(comicPath);
            if (comicStat && comicStat.isDirectory()) {
                await this.analyseComicsFolderName(comicFolder);
            }
        }
        this.getComics(res);
    }

    private async analyseIssuePath(comic: Comic, issuePath: string) {
        const fileInfos = path.parse(issuePath);

        if (fileInfos.ext !== ".cbr" && fileInfos.ext !== ".cbz") {
            return;
        }

        let issue: Issue = await this.issueRepository.findOne({
            file_name: fileInfos.base
        });
        if (issue) {
            return;
        }

        console.log("new issue found : " + issuePath);
        issue = new Issue(null);
        issue.folder_name = fileInfos.dir;
        issue.file_name = fileInfos.base;
        issue.possessed = true;

        let issueNameSplitted = issue.file_name.match(
            /(.*?)([0-9.]{2,}).*\(([0-9]{4})\).*/
        );
        if (issueNameSplitted && issueNameSplitted.length === 4) {
            issue.title = issueNameSplitted[1].replace(/_/g, " ");
            issue.number = parseFloat(issueNameSplitted[2]);
            issue.year = issueNameSplitted[3];
        } else {
            issueNameSplitted = issue.file_name.match(/(.*) #([0-9]*).*/);
            if (issueNameSplitted && issueNameSplitted.length === 3) {
                issue.title = issueNameSplitted[1].replace(/_/g, " ");
                issue.number = parseFloat(issueNameSplitted[2]);
            }
        }
        if (issue.file_name.indexOf("Annual") > 0) {
            issue.annual = true;
        }
        comic.issues.push(issue);
    }
    async parseIssues(res) {
        const comics = await this.comicRepository.find({
            relations: ["issues", "issues.readingStatus", "publisher"]
        });
        for (const comicIndex in comics) {
            const comic = comics[comicIndex];
            if (!comic.finished && comic.folder_name) {
                const comicsPath = path.resolve(
                    this.config.comicsPath,
                    comic.folder_name
                );
                const readdir = require("recursive-readdir");
                const issueList = await readdir(comicsPath, ["._*"]);
                for (const index in issueList) {
                    const IssuePath = issueList[index];
                    await this.analyseIssuePath(comic, IssuePath);
                }
                await this.comicRepository.save(comic);
            }
        }
        this.getComics(res);
    }

    async getComics(res) {
        const comics = await this.comicRepository.find({
            relations: ["issues", "issues.readingStatus", "publisher"]
        });
        comics.forEach((comic: Comic) => comic.updateCount());
        res.json(comics);
    }

    async getComic(res, comicId: number) {
        const comic: Comic = await this.comicRepository.findOneById(comicId, {
            relations: ["issues", "issues.readingStatus", "publisher"]
        });
        res.json(comic);
    }

    async findExactMapping(res) {
        const comics = await this.comicRepository.find({
            relations: ["issues", "issues.readingStatus", "publisher"]
        });
        let config = this.config;
        for (let comicId in comics) {
            let comic = comics[comicId];
            if (!comic.comicVineId) {
                async function callback(error, found) {
                    if (found) await this.comicRepository.save(comic);
                }
                await comic.findExactMapping(config, callback);
            }
        }
        this.getComics(res);
    }

    async updateLibraryInfos(res) {
        let comics = await this.comicRepository.find({
            relations: ["issues", "issues.readingStatus", "publisher"]
        });
        let config = this.config;
        for (let comicId in comics) {
            let comic = comics[comicId];
            if (!comic.finished) {
                async function callback(error) {
                    await this.comicRepository.save(comic);
                }
                await comic.updateInfos(config, callback);
            }
        }
        if (res) {
            this.getComics(res);
        }
    }

    async updateComicInfos(res, comicId: number) {
        let comic: Comic = await this.comicRepository.findOneById(comicId, {
            relations: ["issues", "issues.readingStatus", "publisher"]
        });
        let that = this;
        async function callback(error) {
            await that.comicRepository.save(comic);
            res.json(comic);
        }
        comic.updateInfos(this.config, callback);
    }

    async updateComicVineId(res, comicId: number, comicVineId: number) {
        let comic: Comic = await this.comicRepository.findOneById(comicId, {
            relations: ["issues", "issues.readingStatus", "publisher"]
        });
        let that = this;
        async function callback(error) {
            await that.comicRepository.save(comic);
            res.json(comic);
        }
        if (comic && comicVineId && comic.comicVineId !== comicVineId) {
            comic.comicVineId = comicVineId;
            comic.updateInfos(this.config, callback);
        } else {
            res.json(comic);
        }
    }
    async updateIssueComicId(res, issueId: number, comicId: number) {
        let issue: Issue = await this.issueRepository.findOneById(issueId, {
            relations: ["comic"]
        });
        if (issue.comic.id === comicId) {
            res.json({ result: "no change found" });
            return;
        }
        if (!issue.possessed) {
            res.json({ result: "don't have the issue" });
            return;
        }
        let comic: Comic = await this.comicRepository.findOneById(comicId, {
            relations: ["issues", "issues.readingStatus", "publisher"]
        });
        for (let index in comic.issues) {
            let comicIssue = comic.issues[index];
            if (issue.number === comicIssue.number) {
                if (comicIssue.file_name) {
                    res.json({ result: "this issue number already exists" });
                    return;
                }
                comicIssue.file_name = issue.file_name;
                comicIssue.folder_name = issue.folder_name;
                comicIssue.possessed = true;
                this.issueRepository.save(comicIssue);
                this.issueRepository.deleteById(issueId);
                res.json({ result: "replaced missing issue" });
                return;
            }
        }
        this.issueRepository.updateById(issueId, { comic: comic });
        res.json({ result: "issue added in the comic" });
    }

    async read(res, issueId: number) {
        let issue: Issue = await this.issueRepository.findOneById(issueId);
        if (issue) {
            issue.readFile(this.config, res);
        }
    }

    updateReadingStatus(readingStatus: ReadingStatus) {
        this.readingStatusRepository.save(readingStatus);
    }
}
