export class ReadingStatus {
    read: boolean;
    pageCount: number;
    currentPage: number;

    constructor(issue: ReadingStatus) {
        if (issue) {
            this.pageCount = issue.pageCount;
            this.currentPage = issue.currentPage;
            this.read = issue.read;
        }
        else {
            this.pageCount = 0;
            this.currentPage = 0;
            this.read = false;
        }
    }
}