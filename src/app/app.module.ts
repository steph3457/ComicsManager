import "reflect-metadata";

import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { CollapseDirective } from "ngx-bootstrap/collapse";
import { ButtonsModule } from "ngx-bootstrap/buttons";

import { AppComponent } from "./app.component";
import { ReaderComponent } from "./reader/reader.component";
import { LibraryComponent } from "./library/library.component";
import { ComicDetailsComponent } from "./comic-details/comic-details.component";

import { LibraryService } from "./library.service";

import { routing } from "./app.routes";
import { ConfigComponent } from "./config/config.component";
import { SimpleNotificationsModule } from "angular2-notifications";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { LocationStrategy, HashLocationStrategy } from "@angular/common";

@NgModule({
    declarations: [
        AppComponent,
        ReaderComponent,
        LibraryComponent,
        ComicDetailsComponent,
        ConfigComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpModule,
        routing,
        SimpleNotificationsModule.forRoot(),
        ButtonsModule.forRoot()
    ],
    providers: [
        LibraryService,
        { provide: LocationStrategy, useClass: HashLocationStrategy }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
