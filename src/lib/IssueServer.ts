import { Issue } from "./Issue";
import { Config } from "./Config";
import path = require('path');
import Unrar = require('node-unrar');
import { ReadingStatus } from "./ReadingStatus";
import { unzip } from 'cross-unzip';

export class IssueServer extends Issue {
  constructor(issue: IssueServer) {
    super(issue);
  }

  updateFromComicVine(comicVineJson) {
    this.title = comicVineJson.name;
    this.api_detail_url = comicVineJson.api_detail_url;
    this.site_detail_url = comicVineJson.site_detail_url;
    this.comicVineId = comicVineJson.id;
    this.number = parseFloat(comicVineJson.issue_number);
    this.image = comicVineJson.image.thumb_url;
    this.date = new Date(comicVineJson.store_date);
    //this.description= comicVineJson.description;
  }

  readFile(config: Config, res) {
    var issuePath = path.resolve(config.comicsPath, this.folder_name, this.file_name);
    var tempPath = path.resolve("./temp", this.folder_name, this.file_name);
    var tempComicPath = path.resolve("./temp", this.folder_name);
    const fs = require('fs');

    if (!fs.existsSync(tempComicPath)) {
      fs.mkdirSync(tempComicPath);
    }
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath);
      unzip(issuePath, tempPath, err => {
        if (err) {
          console.log("unzip fail, try unrar");
          var rar = new Unrar(issuePath);
          rar.extract(tempPath, null, (function (err) {
            console.log(err);
            this.sendImages(res);
          }).bind(this));
        } else {
          this.sendImages(res);
        }
      })
    }
    else {
      this.sendImages(res);
    }
  }
  sendImages(res) {
    const fs = require('fs');
    var imageList: string[] = [];
    var tempPath = path.resolve("./temp", this.folder_name, this.file_name);
    imageList = fs.readdirSync(tempPath);
    if (imageList.length === 1) {
      var extraFolder = imageList[0];
      tempPath = path.resolve(tempPath, extraFolder);
      imageList = fs.readdirSync(tempPath);
      imageList = imageList.map(x => extraFolder + "/" + x);
    }
    res.json(imageList);
  }
  markRead(force: boolean) {
    if (force || !this.readingStatus.read) {
      this.readingStatus.read = true;
      this.readingStatus.currentPage = this.readingStatus.pageCount;
    }
    else {
      this.readingStatus.read = false;
      this.readingStatus.currentPage = 0;
    }
  }
}