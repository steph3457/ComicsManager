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
    position: ["top", "right"],
    lastOnBottom: false
  };
  public notif;

  constructor(
    private libraryService: LibraryService,
    private notificationsService: NotificationsService
  ) { }

  open() {
    this.notif = this.notificationsService.info("test", "test2");
  }
  close() {
    this.notificationsService.remove(this.notif.id);
  }
  ngOnInit() { }
}
