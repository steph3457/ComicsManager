import { Component } from '@angular/core';
import { LibraryService } from './library.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private libraryService: LibraryService) {
  }
}
