import path = require('path');
import { ComicServer } from "./ComicServer";
import { IssueServer } from "./IssueServer";
import { Config } from "./Config";

export class ComicsLibrary {
    private jsonfile = require('jsonfile');
    private comicsLibraryFileName = "comicsLibrary.json";
    private configFileName = "config.json";
    comics: { [name: string]: ComicServer; } = {};
    config: Config;
    constructor() {
        var comicsLibrary = this.jsonfile.readFileSync(this.comicsLibraryFileName, { throws: false });
        var config = this.jsonfile.readFileSync(this.configFileName, { throws: false });
        this.config = new Config(config);
        for (var comic in comicsLibrary) {
            this.comics[comic] = new ComicServer(comicsLibrary[comic]);
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

    findExactMapping() {
        for (var comic in this.comics) {
            this.comics[comic].findExactMapping(this.config);
        }
    }
    updateLibraryInfos() {
        for (var comic in this.comics) {
            this.comics[comic].updateInfos(this.config);
        }
    }
    private analyseComicsFolderName(folderName: string) {
        if (this.comics[folderName]) {
            return;
        }
        var comic: ComicServer = new ComicServer(null);
        comic.folder_name = folderName;
        var folderNameSplitted = folderName.match(/(.*)_\(([0-9]*)\)$/)
        if (folderNameSplitted && folderNameSplitted.length === 3) {
            comic.title = folderNameSplitted[1].replace(/_/g, ' ');
            comic.year = folderNameSplitted[2];

        } else {
            comic.title = folderName;
        };
        this.comics[folderName] = comic;
    }
    parseComics() {
        const fs = require('fs');
        fs.readdir(this.config.comicsPath, ((err, list) => {
            list.forEach(element => {
                var file: string = path.resolve(this.config.comicsPath, element);
                fs.stat(file, (function (err, stat) {
                    if (stat && stat.isDirectory()) {
                        this.analyseComicsFolderName(element);
                    }
                }).bind(this))
            });
        }).bind(this))
    }
    parseIssues() {
        for (var comic in this.comics) {
            this.comics[comic].parseIssues(this.config);
        }
    }
    read(req, res) {
        if (req.comic && this.comics[req.comic] && req.issue) {
            this.comics[req.comic].read(req.issue, this.config, res);
        }
    }
    markRead(issue: IssueServer) {
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
    updateReadingStatus(issue: IssueServer) {
        if (issue.folder_name && this.comics[issue.folder_name]) {
            this.comics[issue.folder_name].updateReadingStatus(issue);
        }
        this.saveLibrary();
    }
}