import { ReadingStatus } from "./ReadingStatus";

export class Issue {

  id: number;
  folder_name: string = "";
  file_name: string = "";
  title: string = "";
  year: string = "";
  image: string = "";
  comicVineId: number;
  number: number;
  readingStatus: ReadingStatus;
  possessed: boolean = false;
  api_detail_url: string = "";
  site_detail_url: string = "";
  annual: boolean = false;
  date: Date;
  constructor(issue: Issue) {
    if (issue) {
      this.id = issue.id;
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
      this.date = new Date(issue.date);
    }
    else {
      this.readingStatus = new ReadingStatus(null);
      this.date = new Date();
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
  public static IssueTitleComparer(issue1: Issue, issue2: Issue) {
    return issue1.title.localeCompare(issue2.title);
  }
  public static IssueFileComparer(issue1: Issue, issue2: Issue) {
    return issue1.file_name.localeCompare(issue2.file_name);
  }
  public static IssueDateComparer(issue1: Issue, issue2: Issue) {
    if (!issue1.date)
      issue1.date = new Date();
    if (!issue2.date)
      issue2.date = new Date();
    return issue1.date.getTime() - issue2.date.getTime();
  }

}