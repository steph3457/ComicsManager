import { Component, OnInit } from '@angular/core';
import { LibraryService } from '../library.service';
import { Location } from '@angular/common';
import { ReadingStatus } from '../../lib/ReadingStatus';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';

@Component({
  selector: 'app-reader',
  templateUrl: './reader.component.html',
  styleUrls: ['./reader.component.css']
})
export class ReaderComponent implements OnInit {

  issueId: number;
  loading: boolean = true;
  images: string[] = [];
  readingStatus: ReadingStatus = new ReadingStatus(null);
  constructor(
    public libraryService: LibraryService,
    private location: Location,
    private route: ActivatedRoute,
    private http: Http,
  ) { }
  ngOnInit() {
    this.fullScreen(true);
    this.issueId = + this.route.snapshot.paramMap.get('id');
    this.http.get('/api/read/' + this.issueId).subscribe(res => {
      this.images = res.json();
      this.readingStatus.pageCount = this.images.length;
      this.loading = false;
    });
  }

  fullScreen(on: boolean) {
    if (on) {
      if (document.body.webkitRequestFullScreen)
        document.body.webkitRequestFullScreen();
      if (document.body.requestFullscreen)
        document.body.requestFullscreen();
    }
    else {
      if (document.webkitCancelFullScreen)
        document.webkitCancelFullScreen();
      if (document.exitFullscreen)
        document.exitFullscreen();
    }
  }

  backToComic() {
    this.location.back();
    this.http.post('/updateReadingStatus', this.readingStatus).subscribe(res => {
      //this.comic = new Comic(res.json());
      //this.updateCount();
    });
    this.fullScreen(false);
  }

  isCurrentPage(index: number): boolean {
    return index === this.readingStatus.currentPage;
  }
  nextPage() {
    if (this.readingStatus.currentPage < this.readingStatus.pageCount - 1)
      this.readingStatus.currentPage++;
    else if (this.readingStatus.currentPage === this.readingStatus.pageCount - 1) {
      this.readingStatus.read = true;
      this.backToComic();
    }
  }
  previousPage() {
    if (this.readingStatus.currentPage > 0)
      this.readingStatus.currentPage--;
  }
  navigate(keyCode) {
    switch (keyCode) {
      case 32:
      case 39:
        this.nextPage();
        break;
      case 37:
        this.previousPage()
        break;
      case 13:
        this.backToComic();
        break;
      default:
        console.log(keyCode);
        break;
    }
  }

  getImageUrl(image: string): string {
    if (this.issueId && image) {
      return "/api/image/" + this.issueId + "/" + encodeURIComponent(image);
    }
    return "";
  }
}
