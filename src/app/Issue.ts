import { ReadingStatus } from "../ReadingStatus";

export class Issue {
  folder_name: string;
  file_name: string;
  title: string;
  year: string;
  image: string;
  comicVineId: number;
  number: string;
  readingStatus: ReadingStatus;
  possessed: boolean;
  api_detail_url: string;
  site_detail_url: string;
  comicId: number;
  annual: boolean;
  date:Date;
  description:string;
  constructor(issue: Issue) {
    this.folder_name = issue.folder_name;
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
    this.description=issue.description;
  }
  update(issue: Issue) {
    this.folder_name = issue.folder_name;
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
    this.readingStatus = issue.readingStatus;
    this.date= issue.date;
    this.description = issue.description;
  }

  getClass() {
    if (this.readingStatus.read)
      return "success";
    if (this.possessed)
      return "info";
    return "danger"
  }
}