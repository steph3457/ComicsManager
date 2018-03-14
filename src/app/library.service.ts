import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { Router } from "@angular/router";
import { Config } from "../lib/Config";
import { Filter } from "../lib/Filter";
import { NotificationsService } from "angular2-notifications";
import { Comic } from "../lib/Comic";
import { Issue } from "../lib/Issue";
import { ReadingStatus } from "../lib/ReadingStatus";

@Injectable()
export class LibraryService {
    title: string = "Comics Library";
    comics: Comic[] = [];
    config: Config;
    comicsComparer: (c1: Comic, c2: Comic) => number = Comic.ComicTitleComparer;
    comicsReverse: boolean = false;
    filter: Filter = new Filter();
    readingStatus: ReadingStatus = new ReadingStatus(null);

    constructor(private http: Http, private router: Router) {
        this.http.get("/api/comics").subscribe(res => {
            this.comics = res.json();
        });
        this.http.get("/api/config").subscribe(res => {
            var config = res.json();
            this.config = new Config(config);
        });
    }

    parseComics(notificationsService: NotificationsService) {
        let notif = notificationsService.info("Parsing comics", "pending...");
        this.http.get("/api/comics/parse").subscribe(res => {
            this.comics = res.json();
            notificationsService.remove(notif.id);
            notificationsService.success("Parsing comics", "complete", {
                timeOut: 2000
            });
        });
    }
    parseIssues(notificationsService: NotificationsService) {
        let notif = notificationsService.info("Parsing issues", "pending...");
        this.http.get("/api/issues/parse").subscribe(res => {
            this.comics = res.json();
            notificationsService.remove(notif.id);
            notificationsService.success("Parsing issues", "complete", {
                timeOut: 2000
            });
        });
    }
    saveConfig(notificationsService: NotificationsService) {
        let notif = notificationsService.info("Save config", "pending...");
        this.http.post("/api/config", this.config).subscribe(res => {
            notificationsService.remove(notif.id);
            notificationsService.success("Save config", "complete", {
                timeOut: 2000
            });
        });
    }
    displayComic(comic: Comic) {
        this.router.navigate(["/comic", comic.id]);
        window.scrollTo(0, 0);
    }

    findExactMapping(notificationsService: NotificationsService) {
        let notif = notificationsService.info(
            "Search comics infos",
            "pending..."
        );
        this.http.get("/api/comics/findExactMapping").subscribe(res => {
            this.comics = res.json();
            notificationsService.remove(notif.id);
            notificationsService.success("Search comics infos", "complete", {
                timeOut: 2000
            });
        });
    }
    updateComicsInfos(notificationsService: NotificationsService) {
        let notif = notificationsService.info(
            "Update comics infos",
            "pending..."
        );
        this.http.get("/api/comics/updateInfos").subscribe(res => {
            this.comics = res.json();
            notificationsService.remove(notif.id);
            notificationsService.success("Update comics infos", "complete", {
                timeOut: 2000
            });
        });
    }
    getInProgressComics() {
        let comics: Comic[] = [];
        let filter = new Filter();
        filter.restriction = "inprogress";
        for (const i in this.comics) {
            if (filter.match(this.comics[i])) {
                comics.push(this.comics[i]);
            }
        }
        comics = comics.sort(Comic.ComicTitleComparer);
        return comics;
    }
    getComics(): Comic[] {
        let comics: Comic[] = [];
        for (let i in this.comics) {
            if (this.filter.match(this.comics[i])) {
                comics.push(this.comics[i]);
            }
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
                if (this.comicsComparer === Comic.ComicTitleComparer) {
                    this.comicsReverse = !this.comicsReverse;
                }
                this.comicsComparer = Comic.ComicTitleComparer;
                break;
            }
            case "year": {
                if (this.comicsComparer === Comic.ComicYearComparer) {
                    this.comicsReverse = !this.comicsReverse;
                }
                this.comicsComparer = Comic.ComicYearComparer;
                break;
            }
            default:
                break;
        }
    }
}
