import { Component } from '@angular/core';
import { LibraryService } from './library.service';
import { NotificationsService } from "angular2-notifications";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public isCollapsed: boolean = true;
  public options = {
    position: ["top", "right"],
    lastOnBottom: false
  };
  constructor(private libraryService: LibraryService, public notificationsService: NotificationsService) {
  }
  public get menuIcon(): string {
    return this.isCollapsed ? '☰' : '✖';
  }
}
