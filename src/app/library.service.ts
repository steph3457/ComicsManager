import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { Config } from "../lib/Config";
import { Filter } from "../lib/Filter";
import { NotificationsService } from "angular2-notifications";
import { Comic } from '../lib/Comic';
import { Issue } from '../lib/Issue';
import { ReadingStatus } from '../lib/ReadingStatus';


@Injectable()
export class LibraryService {

  title: string = 'Comics Library';
  comics: { [name: string]: Comic; } = {};
  config: Config;
  comicsComparer: (c1: Comic, c2: Comic) => number = Comic.ComicTitleComparer;
  comicsReverse: boolean = false;
  filter: Filter = new Filter();
  readingStatus: ReadingStatus = new ReadingStatus(null);

  constructor(private http: Http, private router: Router) {
    this.http.get('/api/comics').subscribe(res => {
      var jsonRes = res.json();
      for (var comic in jsonRes) {
        this.comics[comic] = new Comic(jsonRes[comic]);
      }
    });
    this.http.get('/getConfig').subscribe(res => {
      var config = res.json();
      this.config = new Config(config);
    });
  }

  parseComics(notificationsService: NotificationsService) {
    let notif = notificationsService.info("Parsing comics", "pending...");
    this.http.get('/parseComics').subscribe(res => {
      var jsonRes = res.json();
      this.comics = {};
      for (var comic in jsonRes) {
        this.comics[comic] = new Comic(jsonRes[comic]);
      }
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
      notificationsService.remove(notif.id);
      notificationsService.success("Parsing issues", "complete", { timeOut: 2000 });
    });
  }
  saveConfig(notificationsService: NotificationsService) {
    let notif = notificationsService.info("Save config", "pending...");
    this.http.post('/saveConfig', this.config).subscribe(res => {
      notificationsService.remove(notif.id);
      notificationsService.success("Save config", "complete", { timeOut: 2000 });
    });
  }
  displayComic(comic: Comic) {
    this.router.navigate(['/comic', comic.id]);
    window.scrollTo(0, 0);
  }

  findExactMapping(notificationsService: NotificationsService) {
    let notif = notificationsService.info("Search comics infos", "pending...");
    this.http.get('/findExactMapping').subscribe(res => {
      var jsonRes = res.json();
      this.comics = {};
      for (var comic in jsonRes) {
        this.comics[comic] = new Comic(jsonRes[comic]);
      }
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
      notificationsService.remove(notif.id);
      notificationsService.success("Update comics infos", "complete", { timeOut: 2000 });
    });
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
