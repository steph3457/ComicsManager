export class Publisher {
    api_detail_url: string;
    id: number;
    comicVineId: number;
    name: string;


    constructor(publisher: Publisher) {
        if (publisher) {
            this.api_detail_url = publisher.api_detail_url;
            this.id = publisher.id;
            this.name = publisher.name;
            this.comicVineId = publisher.comicVineId;
        }
    }

}