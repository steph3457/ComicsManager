import { Issue } from "./Issue";
import { Publisher } from "./Publisher";

export class Comic {
  folder_name: string = "";
  title: string = "";
  year: string = "";
  image: string = "";
  comicVineId: number;
  count_of_issues: number = 0;
  count_of_possessed_issues: number = 0;
  count_of_read_issues: number = 0;
  description: string = "";
  api_detail_url: string = "";
  site_detail_url: string = "";
  publisher: Publisher;
  issues: { [name: string]: Issue } = {};
  finished: boolean = false;
  issuesComparer: (i1: Issue, i2: Issue) => number = Issue.IssueNumberComparer;
  issuesReverse: boolean = true;
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
  update(comic: Comic) {
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
  getIssues(): Issue[] {
    var issues: Issue[] = [];
    for (var i in this.issues) {
      issues.push(this.issues[i]);
    }
    issues = issues.sort(this.issuesComparer);
    if (this.issuesReverse) {
      issues = issues.reverse();
    }
    return issues;
  }
  sortBy(column: string) {
    switch (column) {
      case "title": {
        if (this.issuesComparer === Issue.IssueTitleComparer)
          this.issuesReverse = !this.issuesReverse;
        this.issuesComparer = Issue.IssueTitleComparer;
        break;
      }
      case "date": {
        if (this.issuesComparer === Issue.IssueDateComparer)
          this.issuesReverse = !this.issuesReverse;
        this.issuesComparer = Issue.IssueDateComparer;
        break;
      }
      case "number": {
        if (this.issuesComparer === Issue.IssueNumberComparer)
          this.issuesReverse = !this.issuesReverse;
        this.issuesComparer = Issue.IssueNumberComparer;
        break;
      }
      case "file": {
        if (this.issuesComparer === Issue.IssueFileComparer)
          this.issuesReverse = !this.issuesReverse;
        this.issuesComparer = Issue.IssueFileComparer;
        break;
      }
      default:
        break;

    }
  }

  updateCount() {
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

  public static ComicTitleComparer(comic1: Comic, comic2: Comic) {
    if (comic1.title && comic2.title)
      return comic1.title.localeCompare(comic2.title);
    else return 0;
  }
  public static ComicYearComparer(comic1: Comic, comic2: Comic) {
    if (comic1.year && comic2.year)
      return comic1.year.localeCompare(comic2.year);
    else return 0;
  }
}