import { Component, OnInit } from '@angular/core';
import { LibraryService } from '../library.service';
import { Comic } from "../Comic";
import { Issue } from "../Issue";

@Component({
  selector: 'app-comic-details',
  templateUrl: './comic-details.component.html',
  styleUrls: ['./comic-details.component.css']
})
export class ComicDetailsComponent implements OnInit {

  comic: Comic;
  edit: boolean = false;
  constructor(private libraryService: LibraryService) {
    this.comic = libraryService.comic;
  }

  editMode()
  {
    this.edit = !this.edit;
    if(this.edit)
    {
      var comicVineIdInput = document.getElementById("comicVineIdInput");
      comicVineIdInput.focus();
    }
    else
    {
      this.libraryService.updateComicVineId(this.comic.comicVineId);
    }
  }

  ngOnInit() {
  }

}
