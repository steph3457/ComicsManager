import { Component, OnInit } from '@angular/core';
import { LibraryService } from '../library.service';
import { NotificationsService } from "angular2-notifications";

@Component({
  selector: 'app-comic-details',
  templateUrl: './comic-details.component.html',
  styleUrls: ['./comic-details.component.css']
})
export class ComicDetailsComponent implements OnInit {

  edit: boolean = false;
  constructor(public libraryService: LibraryService, public notificationsService: NotificationsService) { }

  editMode() {
    this.edit = !this.edit;
    if (this.edit) {
      var comicVineIdInput = document.getElementById("comicVineIdInput");
      comicVineIdInput.focus();
    }
    else {
      this.libraryService.updateComicVineId(this.notificationsService);
    }
  }

  ngOnInit() {
  }

}
