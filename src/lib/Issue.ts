import { ReadingStatus } from "./ReadingStatus";

export class Issue {
  folder_name: string;
  file_name: string;
  title: string;
  year: string;
  image: string;
  comicVineId: number;
  number: number;
  readingStatus: ReadingStatus;
  possessed: boolean = false;
  api_detail_url: string;
  site_detail_url: string;
  comicId: number;
  annual: boolean = false;
  date: Date;
  constructor(issue: Issue) {
    if (issue) {
      this.update(issue);
    }
    else {
      this.readingStatus = new ReadingStatus(null);
    }
  }
  update(issue: Issue) {
    if (issue) {
      if (issue.folder_name)
        this.folder_name = issue.folder_name;
      if (issue.file_name)
        this.file_name = issue.file_name;
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
      this.date = issue.date;
    }
  }

  getClass() {
    if (this.readingStatus.read)
      return "success";
    if (this.possessed)
      return "info";
    return "danger"
  }

  public static IssueNumberComparer(issue1: Issue, issue2: Issue) {
    return issue1.number - issue2.number;
  }
  public static IssueNameComparer(issue1: Issue, issue2: Issue) {
    return issue1.title.localeCompare(issue2.title);
  }

}