import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { Comic } from "../lib/Comic";
import { Issue } from "../lib/Issue";
import { Config } from "../lib/Config";

@Injectable()
export class LibraryService {

  title: string = 'Comics Library';
  comics: { [name: string]: Comic; } = {};
  comic: Comic;
  issue: Issue;
  images: string[];
  count_of_possessed_issues: number = 0;
  count_of_read_issues: number = 0;
  loading: boolean = false;
  config: Config;
  comicsComparer: (c1: Comic, c2: Comic) => number = Comic.ComicTitleComparer;
  comicsReverse: boolean = false;

  constructor(private http: Http, private router: Router) {
    this.http.get('/getLibrary').subscribe(res => {
      var jsonRes = res.json();
      for (var comic in jsonRes) {
        this.comics[comic] = new Comic(jsonRes[comic]);
      }
      this.updateCount();
    });
    this.http.get('/getConfig').subscribe(res => {
      var config = res.json();
      this.config = new Config(config);
    });
  }
  updateCount() {
    this.count_of_possessed_issues = 0;
    this.count_of_read_issues = 0;
    for (var c in this.comics) {

      var comic = this.comics[c];
      comic.updateCount();
      this.count_of_possessed_issues += comic.count_of_possessed_issues;
      this.count_of_read_issues += comic.count_of_read_issues;
    }
  }
  parseComics() {
    this.http.get('/parseComics').subscribe(res => {
      var jsonRes = res.json();
      this.comics = {};
      for (var comic in jsonRes) {
        this.comics[comic] = new Comic(jsonRes[comic]);
      }
      this.updateCount();
    });
  }
  parseIssues() {
    this.http.get('/parseIssues').subscribe(res => {
      var jsonRes = res.json();
      this.comics = {};
      for (var comic in jsonRes) {
        this.comics[comic] = new Comic(jsonRes[comic]);
      }
      this.updateCount();
    });
  }
  saveLibrary() {
    this.http.get('/saveLibrary').subscribe(res => {
      var jsonRes = res.json();
      this.comics = {};
      for (var comic in jsonRes) {
        this.comics[comic] = new Comic(jsonRes[comic]);
      }
      this.updateCount();
    });
  }
  saveConfig() {
    this.http.post('/saveConfig', this.config).subscribe(res => {
      this.config = res.json();
    });
  }
  displayComic(comic) {
    this.comic = comic;
    this.router.navigate(['/comic']);
    window.scrollTo(0, 0);
  }
  backToComic() {
    this.http.post('/updateReadingStatus', this.issue).subscribe(res => {
      this.comic.update(res.json());
      this.updateCount();
    });
    this.fullScreen(false);
    this.router.navigate(['/comic']);
    window.scrollTo(0, 0);
  }
  markRead(issue: Issue) {
    var body: any = { folder_name: this.comic.folder_name };
    if (issue) {
      body.file_name = issue.file_name;
    }
    this.http.post('/markRead', body).subscribe(res => {
      this.comic.update(res.json());
      this.updateCount();
    });
  }
  findExactMapping() {
    this.http.get('/findExactMapping').subscribe(res => {
      var jsonRes = res.json();
      this.comics = {};
      for (var comic in jsonRes) {
        this.comics[comic] = new Comic(jsonRes[comic]);
      }
      this.updateCount();
    });
  }
  updateComicsInfos() {
    this.http.get('/updateLibraryInfos').subscribe(res => {
      var jsonRes = res.json();
      this.comics = {};
      for (var comic in jsonRes) {
        this.comics[comic] = new Comic(jsonRes[comic]);
      }
      this.updateCount();
    });
  }
  updateComicInfos() {
    this.http.get('/updateLibraryInfos/' + encodeURI(this.comic.folder_name)).subscribe(res => {
      this.comic.update(res.json());
      this.updateCount();
    });
  }
  updateComicVineId() {
    this.http.get('/updateComicVineId/' + encodeURI(this.comic.folder_name) + "/" + this.comic.comicVineId).subscribe(res => {
      this.comic.update(res.json());
      this.updateCount();
    });
  }
  read(issue: Issue) {
    this.loading = true;
    this.fullScreen(true);
    var body: any = { comic: this.comic.folder_name, issue: issue.file_name };
    this.http.post('/read', body).subscribe(res => {
      this.issue = issue;
      this.images = res.json();
      this.issue.readingStatus.pageCount = this.images.length;
      this.router.navigate(['/reader']);
      this.loading = false;
      window.scrollTo(0, 0);
    });
  }
  getImageUrl(image: string): string {
    if (this.issue && image) {
      return "/image/" + encodeURI(this.issue.folder_name) + "/" + encodeURI(this.issue.file_name) + "/" + encodeURI(image);
    }
    return "";
  }
  isCurrentPage(index: number): boolean {
    return index === this.issue.readingStatus.currentPage;
  }
  nextPage() {
    if (this.issue.readingStatus.currentPage < this.issue.readingStatus.pageCount - 1)
      this.issue.readingStatus.currentPage++;
    else if (this.issue.readingStatus.currentPage === this.issue.readingStatus.pageCount - 1) {
      this.issue.readingStatus.read = true;
      this.backToComic();
    }
  }
  previousPage() {
    if (this.issue.readingStatus.currentPage > 0)
      this.issue.readingStatus.currentPage--;
  }
  fullScreen(on: boolean) {
    if (on) {
      if (document.body.webkitRequestFullScreen)
        document.body.webkitRequestFullScreen();
      if (document.body.requestFullscreen)
        document.body.requestFullscreen();
    }
    else {
      if (document.webkitCancelFullScreen)
        document.webkitCancelFullScreen();
      if (document.exitFullscreen)
        document.exitFullscreen();
    }
  }
  getPossessedCount(comic: Comic): number {
    return comic.count_of_possessed_issues;
  }

  getComics(): Comic[] {
    var comics: Comic[] = [];
    for (var i in this.comics) {
      comics.push(this.comics[i]);
    }
    comics = comics.sort(this.comicsComparer);
    if (this.comicsReverse) {
      comics = comics.reverse();
    }
    return comics;
  }
  sortBy(column: string) {
    switch (column) {
      case "title": {
        if (this.comicsComparer === Comic.ComicTitleComparer)
          this.comicsReverse = !this.comicsReverse;
        this.comicsComparer = Comic.ComicTitleComparer;
        break;
      }
      case "year": {
        if (this.comicsComparer === Comic.ComicYearComparer)
          this.comicsReverse = !this.comicsReverse;
        this.comicsComparer = Comic.ComicYearComparer;
        break;
      }
      default:
        break;
    }
  }
}
