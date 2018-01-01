export class ReadingStatus {
    id: number;
    read: boolean;
    pageCount: number;
    currentPage: number;
    issueId: number;

    constructor(readingStatus: ReadingStatus) {
        if (readingStatus) {
            this.pageCount = readingStatus.pageCount;
            this.currentPage = readingStatus.currentPage;
            this.read = readingStatus.read;
            this.id = readingStatus.id;
        }
        else {
            this.pageCount = 0;
            this.currentPage = 0;
            this.read = false;
            this.id = 0;
        }
    }
}