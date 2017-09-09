import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { Comic } from "../lib/Comic";
import { Issue } from "../lib/Issue";
import { Config } from "../lib/Config";
import { Filter } from "../lib/Filter";
import { NotificationsService } from "angular2-notifications";


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
  filter: Filter = new Filter();

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
  parseComics(notificationsService: NotificationsService) {
    let notif = notificationsService.info("Parsing comics", "pending...");
    this.http.get('/parseComics').subscribe(res => {
      var jsonRes = res.json();
      this.comics = {};
      for (var comic in jsonRes) {
        this.comics[comic] = new Comic(jsonRes[comic]);
      }
      this.updateCount();
      notificationsService.remove(notif.id);
      notificationsService.success("Parsing comics", "complete", { timeOut: 2000 });
    });
  }
  parseIssues(notificationsService: NotificationsService) {
    let notif = notificationsService.info("Parsing issues", "pending...");
    this.http.get('/parseIssues').subscribe(res => {
      var jsonRes = res.json();
      this.comics = {};
      for (var comic in jsonRes) {
        this.comics[comic] = new Comic(jsonRes[comic]);
      }
      this.updateCount();
      notificationsService.remove(notif.id);
      notificationsService.success("Parsing issues", "complete", { timeOut: 2000 });
    });
  }
  saveLibrary(notificationsService: NotificationsService) {
    let notif = notificationsService.info("Save library", "pending...");
    this.http.get('/saveLibrary').subscribe(res => {
      var jsonRes = res.json();
      this.comics = {};
      for (var comic in jsonRes) {
        this.comics[comic] = new Comic(jsonRes[comic]);
      }
      this.updateCount();
      notificationsService.remove(notif.id);
      notificationsService.success("Save library", "complete", { timeOut: 2000 });
    });
  }
  reloadLibrary(notificationsService: NotificationsService) {
    let notif = notificationsService.info("Reload library", "pending...");
    this.http.get('/reloadLibrary').subscribe(res => {
      var jsonRes = res.json();
      this.comics = {};
      for (var comic in jsonRes) {
        this.comics[comic] = new Comic(jsonRes[comic]);
      }
      this.updateCount();
      notificationsService.remove(notif.id);
      notificationsService.success("Reload library", "complete", { timeOut: 2000 });
    });
  }
  saveConfig(notificationsService: NotificationsService) {
    let notif = notificationsService.info("Save config", "pending...");
    this.http.post('/saveConfig', this.config).subscribe(res => {
      notificationsService.remove(notif.id);
      notificationsService.success("Save config", "complete", { timeOut: 2000 });
    });
  }
  displayComic(comic) {
    this.comic = comic;
    this.router.navigate(['/comic']);
    window.scrollTo(0, 0);
  }
  backToComic() {
    this.http.post('/updateReadingStatus', this.issue).subscribe(res => {
      this.comic = new Comic(res.json());
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
      this.comic = new Comic(res.json());
      this.updateCount();
    });
  }
  findExactMapping(notificationsService: NotificationsService) {
    let notif = notificationsService.info("Search comics infos", "pending...");
    this.http.get('/findExactMapping').subscribe(res => {
      var jsonRes = res.json();
      this.comics = {};
      for (var comic in jsonRes) {
        this.comics[comic] = new Comic(jsonRes[comic]);
      }
      this.updateCount();
      notificationsService.remove(notif.id);
      notificationsService.success("Search comics infos", "complete", { timeOut: 2000 });
    });
  }
  updateComicsInfos(notificationsService: NotificationsService) {
    let notif = notificationsService.info("Update comics infos", "pending...");
    this.http.get('/updateLibraryInfos').subscribe(res => {
      var jsonRes = res.json();
      this.comics = {};
      for (var comic in jsonRes) {
        this.comics[comic] = new Comic(jsonRes[comic]);
      }
      this.updateCount();
      notificationsService.remove(notif.id);
      notificationsService.success("Update comics infos", "complete", { timeOut: 2000 });
    });
  }
  updateComicInfos(notificationsService: NotificationsService) {
    let notif = notificationsService.info("Update comic infos", "pending...");
    this.http.get('/updateLibraryInfos/' + encodeURI(this.comic.folder_name)).subscribe(res => {
      this.comic = new Comic(res.json());
      this.updateCount();
      notificationsService.remove(notif.id);
      notificationsService.success("Update comic infos", "complete", { timeOut: 2000 });
    });
  }
  updateComicVineId() {
    if (this.comic.comicVineId) {
      this.http.get('/updateComicVineId/' + encodeURI(this.comic.folder_name) + "/" + this.comic.comicVineId).subscribe(res => {
        this.comic = new Comic(res.json());
        this.updateCount();
      });
    }
  }
  read(issue: Issue) {
    if (issue.possessed) {
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
  }
  getImageUrl(image: string): string {
    if (this.issue && image) {
      return "/image/" + encodeURIComponent(this.issue.folder_name) + "/" + encodeURIComponent(this.issue.file_name) + "/" + encodeURIComponent(image);
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
  navigate(keyCode) {
    switch (keyCode) {
      case 32:
      case 39:
        this.nextPage();
        break;
      case 37:
        this.previousPage()
        break;
      case 13:
        this.backToComic();
        break;
      default:
        console.log(keyCode);
        break;
    }
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
      if (this.filter.match(this.comics[i]))
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
