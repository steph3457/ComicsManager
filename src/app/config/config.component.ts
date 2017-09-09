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
  constructor(
    public libraryService: LibraryService,
    public notificationsService: NotificationsService
  ) { }

  ngOnInit() { }
}
