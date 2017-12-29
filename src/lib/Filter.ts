import { Comic } from "./Comic";

export class Filter {
    search: string = "";
    restriction: string = null;
    constructor() { }

    public match(comic: Comic): boolean {
        return this.matchRestriction(comic) &&
            this.matchSearch(comic);
    }
    private matchSearch(comic: Comic): boolean {
        return comic.title.toLowerCase().indexOf(this.search.toLowerCase()) != -1;
    }
    private matchRestriction(comic: Comic): boolean {
        switch (this.restriction) {
            case "unread":
                return this.matchUnread(comic);
            case "missing":
                return this.matchMissing(comic);
            case "unmapped":
                return this.matchunmapped(comic);
            default:
                return true;
        }

    }
    private matchUnread(comic: Comic): boolean {
        return comic.count_of_possessed_issues > comic.count_of_read_issues;
    }
    private matchMissing(comic: Comic): boolean {
        return comic.count_of_issues > comic.count_of_possessed_issues;
    }
    private matchunmapped(comic: Comic): boolean {
        if (comic.comicVineId) {
            return false;
        }
        return true;
    }
}