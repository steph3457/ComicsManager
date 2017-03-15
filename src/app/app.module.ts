import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CollapseDirective } from 'ng2-bootstrap'

import { AppComponent } from './app.component';
import { ReaderComponent } from './reader/reader.component';
import { LibraryComponent } from './library/library.component';
import { ComicDetailsComponent } from './comic-details/comic-details.component';

import { LibraryService } from './library.service';

import { routing } from './app.routes';
import { ConfigComponent } from './config/config.component';

@NgModule({
  declarations: [
    AppComponent,
    ReaderComponent,
    LibraryComponent,
    ComicDetailsComponent,
    ConfigComponent,
    CollapseDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing
  ],
  providers: [LibraryService],
  bootstrap: [AppComponent]
})
export class AppModule { }
