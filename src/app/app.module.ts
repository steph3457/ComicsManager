import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { CollapseDirective } from "ng2-bootstrap/collapse";
import { ButtonsModule } from "ng2-bootstrap/buttons";

import { AppComponent } from "./app.component";
import { ReaderComponent } from "./reader/reader.component";
import { LibraryComponent } from "./library/library.component";
import { ComicDetailsComponent } from "./comic-details/comic-details.component";

import { LibraryService } from "./library.service";

import { routing } from "./app.routes";
import { ConfigComponent } from "./config/config.component";
import { SimpleNotificationsModule } from "angular2-notifications";

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
        FormsModule,
        HttpModule,
        routing,
        SimpleNotificationsModule.forRoot(),
        ButtonsModule.forRoot()
    ],
    providers: [LibraryService],
    bootstrap: [AppComponent]
})
export class AppModule {}
