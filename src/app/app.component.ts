import { Component } from '@angular/core';
import { LibraryService } from './library.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public isCollapsed: boolean = true;
  constructor(private libraryService: LibraryService) {
  }
  public get menuIcon(): string {
    return this.isCollapsed ? '☰' : '✖';
  }
}
