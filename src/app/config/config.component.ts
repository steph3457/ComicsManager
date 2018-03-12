import { Form } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { LibraryService } from "../library.service";
import { NotificationsService } from "angular2-notifications";
import { Http } from "@angular/http";

@Component({
    selector: "app-config",
    templateUrl: "./config.component.html",
    styleUrls: ["./config.component.css"]
})
export class ConfigComponent implements OnInit {
    comicTitle: string;
    comicYear: string;

    constructor(
        public libraryService: LibraryService,
        public notificationsService: NotificationsService,
        private http: Http
    ) {}

    ngOnInit() {}

    createComic() {
        let notif = this.notificationsService.info(
            "Creating comic",
            "pending..."
        );
        this.http
            .post("/api/comics/create", {
                comicTitle: this.comicTitle,
                comicYear: this.comicYear
            })
            .subscribe(res => {
                this.libraryService.comics = res.json();
                this.notificationsService.remove(notif.id);
                this.notificationsService.success("Comic created", "complete", {
                    timeOut: 2000
                });
            });
    }
}
