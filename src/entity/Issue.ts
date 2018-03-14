import { ReadingStatus } from "./ReadingStatus";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToOne,
    JoinColumn
} from "typeorm";
import { Comic } from "./Comic";
import * as path from "path";
import { Config } from "./Config";
import * as Unrar from "node-unrar";
import { unzip } from "cross-unzip";

@Entity()
export class Issue {
    @PrimaryGeneratedColumn() id: number;
    @ManyToOne(type => Comic, comic => comic.issues, {
        cascadeInsert: true,
        cascadeUpdate: true,
        cascadeRemove: false
    })
    comic: Comic;
    @Column({ default: "" })
    folder_name: string = "";
    @Column({ default: "" })
    file_name: string = "";
    @Column({ default: "" })
    title: string = "";
    @Column({ default: "" })
    year: string = "";
    @Column({ default: "" })
    image: string = "";
    @Column({ default: 0 })
    comicVineId: number;
    @Column({ default: 0 })
    number: number;
    @OneToOne(type => ReadingStatus, readingStatus => readingStatus.issue, {
        cascadeInsert: true,
        cascadeUpdate: false,
        cascadeRemove: false
    })
    @JoinColumn()
    readingStatus: ReadingStatus;
    @Column({ default: false })
    possessed: boolean = false;
    @Column({ default: "" })
    api_detail_url: string = "";
    @Column({ default: "" })
    site_detail_url: string = "";
    @Column({ default: false })
    annual: boolean = false;
    @Column({ type: "date", nullable: true })
    date: Date;
    constructor(issue: Issue) {
        if (issue) {
            if (issue.folder_name) {
                this.folder_name = issue.folder_name;
            }
            if (issue.file_name) {
                this.file_name = issue.file_name;
            }
            this.title = issue.title;
            this.year = issue.year;
            this.image = issue.image;
            this.comicVineId = issue.comicVineId;
            this.number = issue.number;
            this.possessed = issue.possessed;
            this.api_detail_url = issue.api_detail_url;
            this.site_detail_url = issue.site_detail_url;
            this.annual = issue.annual;
            this.readingStatus = new ReadingStatus(issue.readingStatus);
            this.date = new Date(issue.date);
        } else {
            this.readingStatus = new ReadingStatus(null);
            this.date = new Date();
        }
    }
    updateFromComicVine(comicVineJson) {
        if (comicVineJson) {
            if (comicVineJson.name) {
                this.title = comicVineJson.name;
            }
            this.api_detail_url = comicVineJson.api_detail_url;
            this.site_detail_url = comicVineJson.site_detail_url;
            this.comicVineId = comicVineJson.id;
            this.number = parseFloat(comicVineJson.issue_number);
            this.image = comicVineJson.image.thumb_url;
            this.date = new Date(comicVineJson.store_date);
        }
    }

    readFile(config: Config, res) {
        const issuePath = path.resolve(
            config.comicsPath,
            this.folder_name,
            this.file_name
        );
        const tempPath = path.resolve("./temp", "" + this.id);
        const fs = require("fs");

        if (!fs.existsSync(tempPath)) {
            fs.mkdirSync(tempPath);
            unzip(issuePath, tempPath, err => {
                if (err) {
                    console.log("unzip fail, try unrar");
                    const rar = new Unrar(issuePath);
                    rar.extract(
                        tempPath,
                        null,
                        function(rarError) {
                            console.log(rarError);
                            this.sendImages(res);
                        }.bind(this)
                    );
                } else {
                    this.sendImages(res);
                }
            });
        } else {
            this.sendImages(res);
        }
    }
    sendImages(res) {
        const fs = require("fs");
        let imageList: string[] = [];
        let tempPath = path.resolve("./temp", "" + this.id);
        imageList = fs.readdirSync(tempPath);
        if (imageList.length === 1) {
            const extraFolder = imageList[0];
            tempPath = path.resolve(tempPath, extraFolder);
            imageList = fs.readdirSync(tempPath);
            imageList = imageList.map(x => extraFolder + "/" + x);
        }
        res.json(imageList);
    }
}
