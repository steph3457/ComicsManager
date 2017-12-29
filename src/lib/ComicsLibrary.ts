import * as path from 'path';
import * as async from 'async';
import { Issue } from '../entity/Issue';
import { Config } from './Config';
import { Comic } from '../entity/Comic';
import { createConnection } from "typeorm";

export class ComicsLibrary {
    private jsonfile = require('jsonfile');
    private comicsLibraryFileName = 'comicsLibrary.json';
    private configFileName = 'config.json';
    comics: Comic[] = [];
    config: Config;
    constructor(fromJson: boolean) {
        this.config = new Config(this.jsonfile.readFileSync(this.configFileName, { throws: false }));
        if (fromJson) {
            this.loadLibraryFromJson();
        } else {
            this.loadLibrary();
        }
    }
    loadLibrary() {
        createConnection().then(async connection => {
            let comicRepository = connection.getRepository(Comic);
            this.comics = await comicRepository.find({ relations: ["issues", "publisher"] });
        }
        ).catch(error => console.log(error));
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
    read(comic, issue, res) {
        if (comic && this.comics[comic] && issue) {
            this.comics[comic].read(issue, this.config, res);
        }
    }
    markRead(issue: Issue) {
        if (issue.folder_name && this.comics[issue.folder_name]) {
            if (issue.file_name) {
                this.comics[issue.folder_name].markIssueRead(issue.file_name);
            }
            else {
                this.comics[issue.folder_name].markAllIssuesRead();
            }
        }
        this.saveLibrary();
    }
    updateReadingStatus(issue: Issue) {
        if (issue.folder_name && this.comics[issue.folder_name]) {
            this.comics[issue.folder_name].updateReadingStatus(issue);
        }
        this.saveLibrary();
    }
}