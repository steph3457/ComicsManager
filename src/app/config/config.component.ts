import { Form  } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { LibraryService } from '../library.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
})
export class ConfigComponent implements OnInit {

  constructor(private libraryService: LibraryService) { }

  ngOnInit() {
  }

}
