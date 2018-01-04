import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToOne
} from "typeorm";
import * as path from "path";
import { Config } from "../lib/Config";
import * as request from "request";
import { Publisher } from "./Publisher";
import { Issue } from "./Issue";

@Entity()
export class Comic {
    @PrimaryGeneratedColumn() id: number;
    @Column({ default: "", unique: true })
    folder_name: string = "";
    @Column({ default: "" })
    title: string = "";
    @Column({ default: "" })
    year: string = "";
    @Column({ default: "" })
    image: string = "";
    @Column({ default: "" })
    comicVineId: number;
    @Column({ default: "" })
    description: string = "";
    @Column({ default: "" })
    api_detail_url: string = "";
    @Column({ default: "" })
    site_detail_url: string = "";
    @ManyToOne(type => Publisher, publisher => publisher.comics, {
        nullable: true,
        cascadeInsert: true,
        cascadeUpdate: true,
        cascadeRemove: false
    })
    publisher: Publisher;
    @OneToMany(type => Issue, issue => issue.comic, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    issues: Issue[] = [];
    @Column({ default: false })
    finished: boolean = false;

    count_of_issues: number = 0;
    count_of_missing_issues: number = 0;
    count_of_unread_issues: number = 0;

    constructor(comic: Comic) {
        if (comic) {
            this.folder_name = comic.folder_name;
            this.title = comic.title;
            this.year = comic.year;
            this.image = comic.image;
            this.comicVineId = comic.comicVineId;
            this.count_of_issues = comic.count_of_issues;
            this.count_of_missing_issues = comic.count_of_missing_issues;
            this.count_of_unread_issues = comic.count_of_unread_issues;
            this.description = comic.description;
            this.api_detail_url = comic.api_detail_url;
            this.site_detail_url = comic.site_detail_url;
            this.publisher = new Publisher(comic.publisher);
            this.finished = comic.finished;
            for (const issue in comic.issues) {
                this.issues.push(new Issue(comic.issues[issue]));
            }
        }
    }

    updateCount() {
        let possessed = 0;
        let read = 0;
        this.count_of_issues = 0;
        for (const issue in this.issues) {
            if (!this.issues[issue].annual) {
                this.count_of_issues++;
                if (this.issues[issue].readingStatus.read) {
                    read++;
                }
                if (this.issues[issue].possessed) {
                    possessed++;
                }
            }
        }
        this.count_of_missing_issues = this.count_of_issues - possessed;
        this.count_of_unread_issues = this.count_of_issues - read;
        this.issues = [];
        this.description = "";
    }

    // Server part
    update(comicVineJson) {
        this.count_of_issues = comicVineJson.issues
            ? comicVineJson.issues.length
            : comicVineJson.count_of_issues;
        if (comicVineJson.image) {
            this.image = comicVineJson.image.thumb_url;
        }
        this.api_detail_url = comicVineJson.api_detail_url;
        this.site_detail_url = comicVineJson.site_detail_url;
        if (
            this.publisher &&
            comicVineJson.publisher &&
            this.publisher.comicVineId !== comicVineJson.publisher.id
        ) {
            this.publisher = new Publisher(comicVineJson.publisher);
        }
        this.comicVineId = comicVineJson.id;
        this.description = comicVineJson.description;
        this.year = comicVineJson.start_year;
    }

    updateIssueInformation(comicVineJson) {
        const issueNumber: number = parseFloat(comicVineJson.issue_number);
        let found = false;
        let issue: Issue;
        for (const i in this.issues) {
            if (
                this.issues[i].number === issueNumber &&
                !this.issues[i].annual
            ) {
                found = true;
                issue = this.issues[i];
            }
        }
        if (!found) {
            issue = new Issue(null);
            this.issues.push(issue);
        }
        issue.updateFromComicVine(comicVineJson);
    }

    findExactMapping(config: Config, callback) {
        if (this.comicVineId) {
            console.log("Mapping already exist for " + this.folder_name);
            return;
        }
        let page = 0;
        const url =
            "http://comicvine.gamespot.com/api/search/?api_key=" +
            config.comicVineAPI +
            "&limit=100" +
            "&page=" +
            page +
            "&query=" +
            encodeURI(this.title) +
            "&resources=volume&format=json";
        const headers = {
            "User-Agent": "Super Agent/0.0.1",
            "Content-Type": "application/x-www-form-urlencoded"
        };
        const options = {
            url: url,
            method: "GET",
            headers: headers
        };
        function requestCallback(error, response, body) {
            if (error) {
                callback(error);
            }
            if (!error && response.statusCode == 200) {
                var body = JSON.parse(body);
                var found = false;
                var nextPage = false;
                page++;
                if (body.number_of_total_results > page * body.limit) {
                    nextPage = true;
                }
                var results = body.results;

                for (var i = 0; i < results.length; i++) {
                    var comic = results[i];
                    var comicName = comic.name
                        .replace(/[\- :()_&,/\\]/g, "")
                        .toLowerCase();
                    var title = this.title
                        .replace(/[\- :()_&,/\\]/g, "")
                        .toLowerCase();

                    if (
                        comicName === title &&
                        comic.start_year === this.year &&
                        comic.publisher &&
                        config.publishers[comic.publisher.name]
                    ) {
                        console.log("Found : " + this.title);
                        found = true;
                        this.update(comic);
                    }
                }
                if (!found && nextPage) {
                    var url =
                        "http://comicvine.gamespot.com/api/search/?api_key=" +
                        config.comicVineAPI +
                        "&limit=100" +
                        "&page=" +
                        page +
                        "query=" +
                        this.title +
                        "&resources=volume&format=json";
                    var headers = {
                        "User-Agent": "Super Agent/0.0.1",
                        "Content-Type": "application/x-www-form-urlencoded"
                    };
                    var options = {
                        url: url,
                        method: "GET",
                        headers: headers
                    };
                    request(options, callback);
                } else if (!found) {
                    console.log("Not Found : " + this.title);
                }
                callback(null, found);
            } else {
                console.log("Error: " + error);
                console.log("Status: " + response.statusCode);
            }
        }
        request(options, requestCallback.bind(this));
    }

    updateInfos(config: Config, callback) {
        if (!this.comicVineId) {
            console.log(
                "unable to find extra information in comic vine for " +
                    this.folder_name
            );
            callback(null);
            return;
        }
        this.updateComicInfos(config);
        this.updateIssuesInfos(config, callback);
    }
    private updateComicInfos(config: Config) {
        var url =
            "http://comicvine.gamespot.com/api/volume/4050-" +
            this.comicVineId +
            "/?api_key=" +
            config.comicVineAPI +
            "&format=json";
        var headers = {
            "User-Agent": "Super Agent/0.0.1",
            "Content-Type": "application/x-www-form-urlencoded"
        };
        var options = {
            url: url,
            method: "GET",
            headers: headers
        };
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var body = JSON.parse(body);
                var comic = body.results;
                this.update(comic);
            }
        }
        request(options, callback.bind(this));
    }
    private updateIssuesInfos(config: Config, callback) {
        var url =
            "http://comicvine.gamespot.com/api/issues/?api_key=" +
            config.comicVineAPI +
            "&filter=volume:" +
            this.comicVineId +
            "&format=json";
        var headers = {
            "User-Agent": "Super Agent/0.0.1",
            "Content-Type": "application/x-www-form-urlencoded"
        };
        var options = {
            url: url,
            method: "GET",
            headers: headers
        };
        function requestCallback(error, response, body) {
            if (error) {
                callback(error);
            }
            if (!error && response.statusCode == 200) {
                var body = JSON.parse(body);
                var issues = body.results;
                for (var i in issues) {
                    this.updateIssueInformation(issues[i]);
                }
                callback();
            }
        }
        request(options, requestCallback.bind(this));
    }
}
