import * as path from 'path';
import * as async from 'async';
import { Issue } from '../entity/Issue';
import { Config } from './Config';
import { Comic } from '../entity/Comic';
import { createConnection, ConnectionOptions, Connection } from "typeorm";
import { Publisher } from '../entity/Publisher';
import { ReadingStatus } from '../entity/ReadingStatus';

export class ComicsLibrary {
    private jsonfile = require('jsonfile');
    private comicsLibraryFileName = 'comicsLibrary.json';
    private configFileName = 'config.json';
    comics: Comic[] = [];
    config: Config;
    private connection: Connection;

    constructor(fromJson: boolean) {
        this.config = new Config(this.jsonfile.readFileSync(this.configFileName, { throws: false }));
        if (fromJson) {
            this.loadLibraryFromJson();
        } else {
            this.loadLibrary();
        }
    }
    async loadLibrary() {
        this.connection = await createConnection();
        let comicRepository = this.connection.getRepository(Comic);
        this.comics = await comicRepository.find({ relations: ["publisher"] });
    }
    loadLibraryFromJson() {
        this.comics = [];
        const comicsLibrary = this.jsonfile.readFileSync(this.comicsLibraryFileName, { throws: false });
        for (const comic in comicsLibrary) {
            this.comics[comic] = new Comic(comicsLibrary[comic]);
        }
    }

    saveLibrary() {
        this.jsonfile.writeFileSync(this.comicsLibraryFileName, this.comics, {
            spaces: 2
        });
    }
    saveConfig(config: Config) {
        if (config) {
            this.config = config;
        }
        this.jsonfile.writeFileSync(this.configFileName, this.config, {
            spaces: 2
        });
    }

    findExactMapping(res) {
        function response(err) {
            if (err) {
                console.log(err);
            }
            this.saveLibrary();
            res.json(this.comics);
        }
        function findExactMapping(comic: Comic, callback) {
            comic.findExactMapping(this.config, callback);
        }
        async.each(this.comics, findExactMapping.bind(this), response.bind(this));
    }
    removeDuplicateIssues() {
        for (var comic in this.comics) {
            this.comics[comic].removeDuplicateIssues();
        }
        this.saveLibrary();
    }
    updateLibraryInfos(res) {
        function response(err) {
            if (err) {
                console.log(err);
            }
            this.saveLibrary();
            if (res) {
                res.json(this.comics);
            }
        }
        function updateInfos(comic: Comic, callback) {
            comic.updateInfos(this.config, callback);
        }
        async.each(this.comics, updateInfos.bind(this), response.bind(this));
    }
    private analyseComicsFolderName(folderName: string) {
        if (this.comics[folderName]) {
            return;
        }
        var comic: Comic = new Comic(null);
        comic.folder_name = folderName;
        var folderNameSplitted = folderName.match(/(.*)\(([0-9]{4})\)$/)
        if (folderNameSplitted && folderNameSplitted.length === 3) {
            comic.title = folderNameSplitted[1].replace(/_/g, ' ');
            comic.year = folderNameSplitted[2];

        } else {
            comic.title = folderName;
        };
        this.comics[folderName] = comic;
    }
    parseComics(res) {
        const fs = require('fs');

        function response(err) {
            if (err) {
                console.log(err);
            }
            this.saveLibrary();
            res.json(this.comics);
        }
        function parseFile(element, callback) {
            var file: string = path.resolve(comicsPath, element);
            fs.stat(file, (function (err, stat) {
                if (err) {
                    callback(err);
                    return;
                }
                if (stat && stat.isDirectory()) {
                    this.analyseComicsFolderName(element);
                }
                callback();
            }).bind(this))
        }

        var comicsPath = this.config.comicsPath;
        fs.readdir(comicsPath, ((err, list) => {
            if (err) {
                console.log(err);
                return;
            }
            async.each(list, parseFile.bind(this), response.bind(this));
        }).bind(this))
    }
    parseIssues(res) {
        var comicsPath = this.config.comicsPath;
        function response(err) {
            if (err) {
                console.log(err);
            }
            this.saveLibrary();
            res.json(this.comics);
        }
        function parseIssues(comic: Comic, callback) {
            comic.parseIssues(comicsPath, callback);
        }
        async.each(this.comics, parseIssues, response.bind(this));
    }

    updateReadingStatus(readingStatus: ReadingStatus) {
        let readingStatusRepository = this.connection.getRepository(ReadingStatus);
        readingStatusRepository.save(readingStatus);
    }

    async getComic(res, comicId: number) {
        let comicRepository = this.connection.getRepository(Comic);
        let comic: Comic = await comicRepository.findOneById(comicId, { relations: ["issues", "issues.readingStatus", "publisher"] });
        res.json(comic);
    }

    async updateComicInfos(res, comicId: number) {
        let comicRepository = this.connection.getRepository(Comic);
        let comic: Comic = await comicRepository.findOneById(comicId, { relations: ["issues", "issues.readingStatus", "publisher"] });
        async function callback(error) {
            await comicRepository.save(comic);
            res.json(comic);
        }
        comic.updateInfos(this.config, callback);
    }

    async updateComicVineId(res, comicId: number, comicVineId: number) {
        let comicRepository = this.connection.getRepository(Comic);
        let comic: Comic = await comicRepository.findOneById(comicId, { relations: ["issues", "issues.readingStatus", "publisher"] });
        async function callback(error) {
            await comicRepository.save(comic);
            res.json(comic);
        }
        if (comic && comicVineId && comic.comicVineId !== comicVineId) {
            comic.comicVineId = comicVineId;
            comic.updateInfos(this.config, callback);
        } else {
            res.json(comic);
        }
    }

    async read(res, issueId: number) {
        let issueRepository = this.connection.getRepository(Issue);
        let issue: Issue = await issueRepository.findOneById(issueId);
        if (issue) {
            issue.readFile(this.config, res);
        }
    }
}