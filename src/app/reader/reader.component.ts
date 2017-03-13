import { Component, OnInit } from '@angular/core';
import { LibraryService } from '../library.service';

@Component({
  selector: 'app-reader',
  templateUrl: './reader.component.html',
  styleUrls: ['./reader.component.css']
})
export class ReaderComponent implements OnInit {

  images: string[] = [];
  constructor(private libraryService: LibraryService) {
    this.images = libraryService.images;
  }
  ngOnInit() {
  }
}
