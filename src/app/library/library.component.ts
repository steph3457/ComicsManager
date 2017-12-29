import { Component, OnInit } from '@angular/core';
import { LibraryService } from '../library.service';
import { Comic } from "../../lib/Comic";

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit {

  constructor(public libraryService: LibraryService) { }
  ngOnInit() {
  }

}
