import { Form } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { LibraryService } from "../library.service";
import { NotificationsService } from "angular2-notifications";

@Component({
    selector: "app-config",
    templateUrl: "./config.component.html",
    styleUrls: ["./config.component.css"]
})
export class ConfigComponent implements OnInit {
    public options = {
        position: ["bottom", "left"],
        timeOut: 5000,
        lastOnBottom: true
    };

    constructor(
        private libraryService: LibraryService,
        private notificationsService: NotificationsService
    ) {}

    test() {
        this.notificationsService.alert("test", "test2");
    }
    ngOnInit() {}
}
