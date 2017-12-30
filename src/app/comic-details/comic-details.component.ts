import { Component, OnInit } from '@angular/core';
import { LibraryService } from '../library.service';
import { NotificationsService } from "angular2-notifications";
import { ActivatedRoute } from '@angular/router';
import { Comic } from '../../lib/Comic';
import { Http } from '@angular/http';

@Component({
  selector: 'app-comic-details',
  templateUrl: './comic-details.component.html',
  styleUrls: ['./comic-details.component.css']
})
export class ComicDetailsComponent implements OnInit {

  edit: boolean = false;
  comic: Comic = new Comic(null);
  constructor(
    public libraryService: LibraryService,
    public notificationsService: NotificationsService,
    private route: ActivatedRoute,
    private http: Http
  ) { }

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

    this.http.get('/api/comic/' + this.route.snapshot.paramMap.get('id')).subscribe(res => {
      this.comic = new Comic(res.json());
    });
  }

}
