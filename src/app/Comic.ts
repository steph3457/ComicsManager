import { Issue } from "./Issue";
import { Publisher } from "./Publisher";

export class Comic {
  folder_name: string;
  title: string;
  year: string;
  image: string;
  comicVineId: number;
  count_of_issues: number;
  count_of_possessed_issues: number;
  count_of_read_issues: number;
  description:string;
  api_detail_url: string;
  site_detail_url: string;
  publisher: Publisher;
  issues: Issue[] = [];
  finished: boolean = false;
  constructor(comic: Comic) {
    this.folder_name = comic.folder_name;
    this.title = comic.title;
    this.year = comic.year;
    this.image = comic.image;
    this.comicVineId = comic.comicVineId;
    this.count_of_issues = comic.count_of_issues;
    this.count_of_possessed_issues = comic.count_of_possessed_issues;
    this.count_of_read_issues = comic.count_of_read_issues;
    this.description = comic.description;
    this.api_detail_url = comic.api_detail_url;
    this.site_detail_url = comic.site_detail_url;
    this.publisher = comic.publisher;
    this.finished = comic.finished;
    for (var issue in comic.issues) {
      this.issues.push(new Issue(comic.issues[issue]));
    }
  }
  update(comic: Comic) {
    this.folder_name = comic.folder_name;
    this.title = comic.title;
    this.year = comic.year;
    this.image = comic.image;
    this.comicVineId = comic.comicVineId;
    this.count_of_issues = comic.count_of_issues;
    this.count_of_possessed_issues = comic.count_of_possessed_issues;
    this.count_of_read_issues = comic.count_of_read_issues;
    this.description= comic.description;
    this.api_detail_url = comic.api_detail_url;
    this.site_detail_url = comic.site_detail_url;
    this.publisher = comic.publisher;
    this.finished = comic.finished;
    for (var issue in this.issues) {
      this.issues[issue].update(comic.issues[this.issues[issue].file_name]);
    }
  }
  public getPossessedClass() {
    return this.getIssueClass(this.count_of_possessed_issues, this.count_of_issues);
  }
  public getReadClass() {
    return this.getIssueClass(this.count_of_read_issues, this.count_of_possessed_issues);
  }
  private getIssueClass(issue: number, issueToCompare: number) {
    if (issue === 0) {
      return "danger";
    }
    if (issue >= issueToCompare) {
      return "success";
    }
    if (issue / issueToCompare < 0.7) {
      return "warning";
    }
    return "info";
  }
}