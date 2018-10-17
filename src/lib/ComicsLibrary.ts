import * as path from "path";
import * as async from "async";
import { Issue } from "../entity/Issue";
import { Comic } from "../entity/Comic";
import { Config } from "../entity/Config";
import { createConnection, ConnectionOptions, Connection } from "typeorm";
import { Publisher } from "../entity/Publisher";
import { ReadingStatus } from "../entity/ReadingStatus";
import { Repository } from "typeorm/repository/Repository";

export class ComicsLibrary {
    private connection: Connection;
    private configRepository: Repository<Config>;
    private comicRepository: Repository<Comic>;
    private issueRepository: Repository<Issue>;
    private readingStatusRepository: Repository<ReadingStatus>;

    constructor(fromJson: boolean) {
        this.openConnection();
    }
    async openConnection() {
        this.connection = await createConnection();
        this.configRepository = this.connection.getRepository(Config);
        this.comicRepository = this.connection.getRepository(Comic);
        this.issueRepository = this.connection.getRepository(Issue);
        this.readingStatusRepository = this.connection.getRepository(
            ReadingStatus
        );
    }

    async getConfig(res) {
        let config = await this.configRepository.findOne();
        if (!config) {
            config = new Config();
        }
        if (res) {
            res.json(config);
        }
        return config;
    }
    async saveConfig(res, reqConfig: Config) {
        let config: Config = await this.configRepository.findOne();
        if (!config) {
            config = new Config();
        }
        config.comicsPath = reqConfig.comicsPath;
        config.comicVineAPI = reqConfig.comicVineAPI;
        await this.configRepository.save(config);
        res.json(config);
    }

    private async analyseComicsFolderName(folderName: string) {
        let comic: Comic = await this.comicRepository.findOne({
            folder_name: folderName
        });
        if (comic) {
            return;
        }
        comic = new Comic();
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
        const config = await this.getConfig(null);
        const libraryPath = config.comicsPath;
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
            else {
                issueNameSplitted = issue.file_name.match(/(.*?)([0-9.]{2,}).*/);
                if (issueNameSplitted && issueNameSplitted.length === 3) {
                    issue.title = issueNameSplitted[1].replace(/_/g, " ");
                    issue.number = parseFloat(issueNameSplitted[2]);
                }
            }
        }
        if (issue.file_name.indexOf("Annual") > 0) {
            issue.annual = true;
        }
        await this.issueRepository.save(issue);
        await this.issueRepository.updateById(issue.id, { comic: comic });
    }
    async parseIssues(res) {
        const comics = await this.comicRepository.find({
            relations: ["issues", "issues.readingStatus", "publisher"]
        });
        const config = await this.getConfig(null);
        for (const comicIndex in comics) {
            const comic = comics[comicIndex];
            if (!comic.finished && comic.folder_name) {
                const comicsPath = path.resolve(
                    config.comicsPath,
                    comic.folder_name
                );
                const readdir = require("recursive-readdir");
                try {
                    const issueList = await readdir(comicsPath, ["._*"]);
                    for (const index in issueList) {
                        const IssuePath = issueList[index];
                        await this.analyseIssuePath(comic, IssuePath);
                    }
                } catch (e) {
                    console.log(
                        "Unable to parse comic : " + comic.folder_name + " " + e
                    );
                }
            }
        }
        this.getComics(res);
    }

    async getComics(res) {
        const comics = await this.comicRepository.find({
            relations: ["issues", "issues.readingStatus", "publisher"],
            order: { title: "ASC", year: "ASC" }
        });
        comics.forEach((comic: Comic) => comic.updateCount());
        res.json(comics);
    }

    async createComic(res, comicTitle: string, comicYear: string) {
        const comic = new Comic();
        comic.title = comicTitle;
        comic.year = comicYear;
        comic.folder_name = comicTitle + " (" + comicYear + ")";
        console.log(comic.folder_name);
        const that = this;
        async function callback(error, found) {
            await that.comicRepository.save(comic);
            that.getComics(res);
        }
        const config = await this.getConfig(null);
        comic.findExactMapping(config, callback);
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
        const config = await this.getConfig(null);
        for (const comicId in comics) {
            const comic = comics[comicId];
            if (!comic.comicVineId) {
                const that = this;
                async function callback(error, found) {
                    if (found) {
                        await that.comicRepository.save(comic);
                    }
                }
                comic.findExactMapping(config, callback);
            }
        }
        this.getComics(res);
    }

    async updateLibraryInfos(res) {
        const comics = await this.comicRepository.find({
            relations: ["issues", "issues.readingStatus", "publisher"]
        });
        const config = await this.getConfig(null);
        for (const comicId in comics) {
            const comic = comics[comicId];
            if (!comic.finished) {
                const that = this;
                async function callback(error) {
                    await that.comicRepository.save(comic);
                }
                comic.updateInfos(config, callback);
            }
        }
        if (res) {
            this.getComics(res);
        }
    }

    async updateComicInfos(res, comicId: number) {
        const comic: Comic = await this.comicRepository.findOneById(comicId, {
            relations: ["issues", "issues.readingStatus", "publisher"]
        });
        const config = await this.getConfig(null);
        const that = this;
        async function callback(error) {
            await that.comicRepository.save(comic);
            res.json(comic);
        }
        comic.updateInfos(config, callback);
    }

    async updateComicVineId(res, comicId: number, comicVineId: number) {
        const comic: Comic = await this.comicRepository.findOneById(comicId, {
            relations: ["issues", "issues.readingStatus", "publisher"]
        });
        const config = await this.getConfig(null);
        const that = this;
        async function callback(error) {
            await that.comicRepository.save(comic);
            res.json(comic);
        }
        if (comic && comicVineId && comic.comicVineId !== comicVineId) {
            comic.comicVineId = comicVineId;
            comic.updateInfos(config, callback);
        } else {
            res.json(comic);
        }
    }
    async updateComicFinished(res, comicId: number, finished: boolean) {
        const comic: Comic = await this.comicRepository.findOneById(comicId, {
            relations: ["issues", "issues.readingStatus", "publisher"]
        });
        await this.comicRepository.updateById(comicId, {
            finished: finished
        });
        res.json(comic);
    }
    async updateIssueComicId(res, issueId: number, comicId: number) {
        const issue: Issue = await this.issueRepository.findOneById(issueId, {
            relations: ["comic"]
        });
        if (issue.comic.id === comicId) {
            res.json({ status: "fail", message: "no change found" });
            return;
        }
        if (!issue.possessed) {
            res.json({ status: "fail", message: "don't have the issue" });
            return;
        }
        const comic: Comic = await this.comicRepository.findOneById(comicId, {
            relations: ["issues", "issues.readingStatus", "publisher"]
        });
        for (const index in comic.issues) {
            const comicIssue = comic.issues[index];
            if (issue.number === comicIssue.number) {
                if (comicIssue.file_name) {
                    res.json({
                        status: "fail",
                        message: "this issue number already exists"
                    });
                    return;
                }
                comicIssue.file_name = issue.file_name;
                comicIssue.folder_name = issue.folder_name;
                comicIssue.possessed = true;
                this.issueRepository.save(comicIssue);
                this.issueRepository.deleteById(issueId);
                res.json({
                    status: "success",
                    message: "replaced missing issue"
                });
                return;
            }
        }
        this.issueRepository.updateById(issueId, { comic: comic });
        res.json({ status: "success", message: "issue added in the comic" });
    }
    async updateIssueNumber(res, issueId: number, issueNumber: number) {
        const issue: Issue = await this.issueRepository.findOneById(issueId);
        if (issue.number === issueNumber) {
            res.json({ status: "fail", message: "no change found" });
            return;
        }
        if (!issue.possessed) {
            res.json({ status: "fail", message: "don't have the issue" });
            return;
        }
        this.issueRepository.updateById(issueId, { number: issueNumber });
        res.json({ status: "success", message: "issue number updated" });

    }

    async deleteIssue(res, issueId: number) {
        await this.issueRepository.deleteById(issueId);
        res.json({ status: "success", message: "issue deleted" });
    }

    async read(res, issueId: number) {
        const config = await this.getConfig(null);
        const issue: Issue = await this.issueRepository.findOneById(issueId);
        if (issue) {
            issue.readFile(config, res);
        }
    }

    async updateReadingStatus(res, readingStatus: ReadingStatus) {
        await this.readingStatusRepository.save(readingStatus);
        res.json({ status: "success", message: "reading status updated" });
    }
}
