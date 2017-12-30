import { Component, OnInit } from '@angular/core';
import { LibraryService } from '../library.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-reader',
  templateUrl: './reader.component.html',
  styleUrls: ['./reader.component.css']
})
export class ReaderComponent implements OnInit {

  images: string[] = [];
  constructor(public libraryService: LibraryService, private location: Location) {
    this.images = libraryService.images;
  }
  ngOnInit() {
  }

  backToComic() {
    this.location.back();
    this.libraryService.backToComic();
  }
}
