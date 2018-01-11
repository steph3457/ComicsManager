import { Comic } from "./Comic";

export class Filter {
    search: string = "";
    restriction: string = "unread";
    constructor() {}

    public match(comic: Comic): boolean {
        return this.matchRestriction(comic) && this.matchSearch(comic);
    }
    private matchSearch(comic: Comic): boolean {
        return (
            comic.title.toLowerCase().indexOf(this.search.toLowerCase()) !== -1
        );
    }
    private matchRestriction(comic: Comic): boolean {
        switch (this.restriction) {
            case "unread":
                return this.matchUnread(comic);
            case "missing":
                return this.matchMissing(comic);
            case "unmapped":
                return this.matchunmapped(comic);
            case "inprogress":
                return this.matchInProgress(comic);
            default:
                return true;
        }
    }
    private matchInProgress(comic: Comic): boolean {
        return !comic.finished;
    }
    private matchUnread(comic: Comic): boolean {
        return comic.count_of_unread_issues > 0;
    }
    private matchMissing(comic: Comic): boolean {
        return comic.count_of_missing_issues > 0;
    }
    private matchunmapped(comic: Comic): boolean {
        if (comic.comicVineId) {
            return false;
        }
        return true;
    }
}
