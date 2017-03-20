import { Comic } from "./Comic";
import request = require('request');
import { Config } from "./Config";
import { IssueServer } from "./IssueServer";
import { Publisher } from "./Publisher";
import path = require('path');

export class ComicServer extends Comic {

  issues: { [name: string]: IssueServer } = {};
  constructor(comic: ComicServer) {
    super(comic);
    if (comic) {
      for (var issue in comic.issues) {
        this.issues[issue] = new IssueServer(comic.issues[issue]);
      }
    }
  }

  update(comicVineJson) {
    this.count_of_issues = comicVineJson.issues ? comicVineJson.issues.length : comicVineJson.count_of_issues;
    if (comicVineJson.image)
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
    var issue: IssueServer;
    for (var i in this.issues) {
      if ((this.issues[i].number == issueNumber) && !this.issues[i].annual) {
        found = true;
        issue = this.issues[i];
      }
    }
    if (!found) {
      issue = new IssueServer(null);
      this.issues[issueNumber] = issue;
    }
    issue.updateFromComicVine(comicVineJson);
  }

  parseIssues(comicsPath: string, callback) {
    const fs = require('fs');
    var issuesFolder = path.resolve(comicsPath, this.folder_name);
    fs.readdir(issuesFolder, (err, list) => {
      if (err) {
        console.log(err);
        callback(err);
        return;
      }
      console.log("Scanning: " + issuesFolder);
      list.forEach(element => {
        if (element.indexOf("._") !== 0 && (element.indexOf(".cbr") !== -1 || element.indexOf(".cbz") !== -1)) {
          this.analyseIssueName(element);
        }
        else {
          console.log("----Not an issue: " + element);
        }
      });
      this.updateCount();
      callback();
    })
  }

  private analyseIssueName(issueName: string) {
    var issue = this.issues[issueName];
    if (!issue) {
      console.log("New Issue: " + issueName);
      issue = new IssueServer(null);
      issue.folder_name = this.folder_name;
      issue.file_name = issueName;
      issue.possessed = true;
      var issueNameSplitted = issueName.match(/(.*)_([0-9.]*)_\(([0-9]*)\).*/)
      if (issueNameSplitted && issueNameSplitted.length === 4) {
        issue.title = issueNameSplitted[1].replace(/_/g, ' ');
        issue.number = parseFloat(issueNameSplitted[2]);
        issue.year = issueNameSplitted[3];
        if (issueName.indexOf("Annual") > 0) {
          issue.annual = true;
        }
      }
      this.issues[issueName] = issue;
    }

    if (this.issues[issue.number]) {
      issue = new IssueServer(this.issues[issue.number]);
      delete this.issues[issue.number];
      issue.folder_name = this.folder_name;
      issue.file_name = issueName;
      issue.possessed = true;
      this.issues[issueName] = issue;
      console.log("mapping new issue to comic vine issue");
    }
  }

  removeDuplicateIssues() {
    for (var i in this.issues) {
      var issue = this.issues[i];
      var issueNumber = parseFloat(i);
      if (issueNumber !== issue.number && this.issues[issue.number]) {
        delete this.issues[issue.number];
      }
    }
  }

  findExactMapping(config: Config, callback) {
    if (this.comicVineId) {
      console.log("Mapping already exist for " + this.folder_name);
      return;
    }
    var page = 0;
    var url = 'http://comicvine.gamespot.com/api/search/?api_key=' + config.comicVineAPI + '&limit=100' + '&page=' + page + '&query=' + encodeURI(this.title) + '&resources=volume&format=json';
    var headers = {
      'User-Agent': 'Super Agent/0.0.1',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    var options = {
      url: url,
      method: 'GET',
      headers: headers
    }
    function requestCallback(error, response, body) {
      if (error) {
        callback(error);
      }
      if (!error && response.statusCode == 200) {
        var body = JSON.parse(body);
        var found = false;
        var nextPage = false;
        if (body.number_of_total_results > body.page * body.limit) {
          nextPage = true;
        }
        var results = body.results;

        for (var i = 0; i < results.length; i++) {
          var comic = results[i];
          if (comic.publisher) {
          }
          var levenshtein = require('fast-levenshtein');
          var distance = levenshtein.get(comic.name, this.title);
          if (distance <= 1 && comic.start_year === this.year && comic.publisher && config.publishers[comic.publisher.name]) {
            console.log("Found : " + this.title);
            found = true;
            this.update(comic);
          }
        }
        if (!found && nextPage) {
          page++;
          var url = 'http://comicvine.gamespot.com/api/search/?api_key=' + config.comicVineAPI + '&limit=100' + '&page=' + page + 'query=' + this.title + '&resources=volume&format=json';
          var headers = {
            'User-Agent': 'Super Agent/0.0.1',
            'Content-Type': 'application/x-www-form-urlencoded'
          }
          var options = {
            url: url,
            method: 'GET',
            headers: headers
          }
          request(options, callback);
        } else if (!found) {
          console.log("Not Found : " + this.title);
        }
        callback();
      } else {
        console.log("Error: " + error);
        console.log("Status: " + response.statusCode);
      }
    }
    request(options, requestCallback.bind(this));
  }

  updateInfos(config: Config, callback) {
    if (!this.comicVineId) {
      console.log("unable to find extra information in comic vine for " + this.folder_name);
      return;
    }
    this.updateComicInfos(config);
    this.updateIssuesInfos(config, callback);
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
  private updateIssuesInfos(config: Config, callback) {
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
    function requestCallback(error, response, body) {
      if (error) {
        callback(error);
      }
      if (!error && response.statusCode == 200) {
        var body = JSON.parse(body);
        console.dir(body);
        var issues = body.results;
        for (var i in issues) {
          this.updateIssueInformation(issues[i]);
        }
        callback();
      }
    }
    request(options, requestCallback.bind(this));
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
    this.updateCount();
  }
  markAllIssuesRead() {
    for (var issue in this.issues) {
      this.issues[issue].markRead(true);
    }
    this.updateCount();
  }
  updateReadingStatus(issue: IssueServer) {
    if (issue.file_name && this.issues[issue.file_name]) {
      this.issues[issue.file_name].readingStatus = issue.readingStatus;
    }
    this.updateCount();
  }
}