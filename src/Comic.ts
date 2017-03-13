import request = require('request');
import { Config } from "./Config";
import { Issue } from "./Issue";
import { Publisher } from "./Publisher";
import path = require('path');

export class Comic {
  folder_name: string;
  title: string;
  year: string;
  image: string;
  comicVineId: number;
  count_of_issues: number;
  count_of_possessed_issues: number;
  count_of_read_issues: number;
  description: string;
  api_detail_url: string;
  site_detail_url: string;
  publisher: Publisher;
  issues: { [name: string]: Issue } = {};
  finished: boolean = false;
  constructor(comic: Comic) {
    if (comic) {
      this.folder_name = comic.folder_name;
      this.title = comic.title;
      this.year = comic.year;
      this.image = comic.image;
      this.comicVineId = comic.comicVineId;
      this.count_of_issues = comic.count_of_issues;
      this.count_of_possessed_issues = comic.count_of_possessed_issues;
      this.count_of_read_issues = comic.count_of_possessed_issues;
      this.description = comic.description;
      this.api_detail_url = comic.api_detail_url;
      this.site_detail_url = comic.site_detail_url;
      this.publisher = new Publisher(comic.publisher);
      this.finished = comic.finished;
      for (var issue in comic.issues) {
        this.issues[issue] = new Issue(comic.issues[issue]);
      }
    }
  }

  update(comicVineJson) {
    this.count_of_issues = comicVineJson.count_of_issues;
    this.image = comicVineJson.image.thumb_url;
    this.api_detail_url = comicVineJson.api_detail_url;
    this.site_detail_url = comicVineJson.site_detail_url;
    this.publisher = new Publisher(comicVineJson.publisher);
    this.comicVineId = comicVineJson.id;
    this.description = comicVineJson.description;
    this.year = comicVineJson.start_year;
  }

  updateIssueInformation(comicVineJson) {
    var issueNumber: number = parseFloat(comicVineJson.issue_number);
    var found = false;
    var issue: Issue;
    for (var i in this.issues) {
      if ((parseFloat(this.issues[i].number) === issueNumber || this.issues[issueNumber]) && !this.issues[i].annual) {
        found = true;
        issue = this.issues[i];
      }
    }
    if (!found) {
      issue = new Issue(null);
      this.issues[issueNumber] = issue;
    }
    issue.update(comicVineJson);
  }

  parseIssues(config: Config) {
    const fs = require('fs');
    var issuesFolder = path.resolve(config.comicsPath, this.folder_name);
    fs.readdir(issuesFolder, (err, list) => {
      console.log("Scanning: " + issuesFolder);
      list.forEach(element => {
        if (element.indexOf(".cbr") > 0 || element.indexOf(".cbz") > 0) {
          this.analyseIssueName(element);
        }
        else {
          console.log("----Not an issue: " + element);
        }
      });
      this.updateIssuesCount();
    })
  }

  private updateIssuesCount() {
    var possessed = 0;
    var read = 0;
    for (var issue in this.issues) {
      if (!this.issues[issue].annual) {
        if (this.issues[issue].readingStatus.read) {
          read++;
        }
        if (this.issues[issue].possessed) {
          possessed++;
        }
      }
    }
    this.count_of_possessed_issues = possessed;
    this.count_of_read_issues = read;
  }
  private analyseIssueName(issueName: string) {
    if (this.issues[issueName]) {
      return;
    }
    console.log("New Issue: " + issueName);
    var issue: Issue = new Issue(null);
    issue.folder_name = this.folder_name;
    issue.file_name = issueName;
    issue.possessed = true;
    var issueNameSplitted = issueName.match(/(.*)_([0-9][0-9][0-9]\.?[0-9]*)_\(([0-9]*)\).*/)
    if (issueNameSplitted && issueNameSplitted.length === 4) {
      issue.title = issueNameSplitted[1].replace(/_/g, ' ');
      issue.number = issueNameSplitted[2];
      issue.year = issueNameSplitted[3];
      if (issueName.indexOf("Annual") > 0) {
        issue.annual = true;
      }
    }
    this.issues[issueName] = issue;
  }

  findExactMapping(config: Config) {
    if (this.comicVineId) {
      console.log("Mapping already exist for " + this.folder_name);
      return;
    }
    var url = 'http://comicvine.gamespot.com/api/volumes/?api_key=' + config.comicVineAPI + '&limit=100&filter=name:' + encodeURIComponent(this.title) + '&format=json';
    var headers = {
      'User-Agent': 'Super Agent/0.0.1',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    var options = {
      url: url,
      method: 'GET',
      headers: headers,
      offset: 0,
      limit: 100
    }
    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        var body = JSON.parse(body);
        var found = false;
        var nextPage = false;
        if (body.number_of_total_results > body.offset + body.limit) {
          nextPage = true;
        }
        var results = body.results;

        for (var i = 0; i < results.length; i++) {
          var comic = results[i];
          if (comic.publisher) {
          }
          if (comic.name === this.title && comic.start_year === this.year && comic.publisher && config.publishers[comic.publisher.name]) {
            console.log("Found : " + this.title);
            found = true;
            this.update(comic);
          }
        }
        if (!found && nextPage) {
          options.offset += options.limit;
          request(options, callback);
        } else if (!found) {
          console.log("Not Found : " + this.title);
        }
      } else
        console.log("Error: " + error);
    }
    request(options, callback.bind(this));
  }

  updateInfos(config: Config) {
    if (!this.comicVineId) {
      console.log("unable to find extra information in comic vine for " + this.folder_name);
      return;
    }
    this.updateComicInfos(config);
    this.updateIssuesInfos(config);
  }
  private updateComicInfos(config: Config) {
    var url = "http://comicvine.gamespot.com/api/volume/4050-" + this.comicVineId + "/?api_key=" + config.comicVineAPI + "&format=json";
    var headers = {
      'User-Agent': 'Super Agent/0.0.1',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    var options = {
      url: url,
      method: 'GET',
      headers: headers
    }
    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        var body = JSON.parse(body);
        console.dir(body);
        var comic = body.results;
        this.update(comic);
      }
    }
    request(options, callback.bind(this));
  }
  private updateIssuesInfos(config: Config) {
    var url = "http://comicvine.gamespot.com/api/issues/?api_key=" + config.comicVineAPI + "&filter=volume:" + this.comicVineId + "&format=json";
    var headers = {
      'User-Agent': 'Super Agent/0.0.1',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    var options = {
      url: url,
      method: 'GET',
      headers: headers
    }
    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        var body = JSON.parse(body);
        console.dir(body);
        var issues = body.results;
        for (var i in issues) {
          this.updateIssueInformation(issues[i]);
        }
      }
    }
    request(options, callback.bind(this));
  }

  read(issueName: string, config: Config, res) {
    if (this.issues[issueName]) {
      return this.issues[issueName].readFile(config, res);
    }
  }
  markIssueRead(issueName: string) {
    if (this.issues[issueName]) {
      this.issues[issueName].markRead(false);
    }
    this.updateIssuesCount();
  }
  markAllIssuesRead() {
    for (var issue in this.issues) {
      this.issues[issue].markRead(true);
    }
    this.updateIssuesCount();
  }
  updateReadingStatus(issue: Issue) {
    if (issue.file_name && this.issues[issue.file_name]) {
      this.issues[issue.file_name].readingStatus = issue.readingStatus;
    }
    this.updateIssuesCount();
  }
}