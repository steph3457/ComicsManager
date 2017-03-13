import { Component, OnInit } from '@angular/core';
import { LibraryService } from '../library.service';
import { Comic } from "../Comic";
@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit {

  comics: Comic[] = [];
  constructor(private libraryService: LibraryService) {
    this.comics = libraryService.comics;
  }
  ngOnInit() {
  }

}
