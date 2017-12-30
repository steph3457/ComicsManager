import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LibraryComponent } from './library/library.component';
import { ComicDetailsComponent } from './comic-details/comic-details.component';
import { ReaderComponent } from './reader/reader.component';
import { ConfigComponent } from './config/config.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/library',
        pathMatch: 'full'
    },
    { path: 'library', component: LibraryComponent },
    { path: 'reader/:id', component: ReaderComponent },
    { path: 'comic/:id', component: ComicDetailsComponent },
    { path: 'config', component: ConfigComponent }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
