export class Publisher {
    api_detail_url: string;
    id: number;
    name: string;
    constructor(publisher: any) {
        if (publisher) {
            this.api_detail_url = publisher.api_detail_url;
            this.id = publisher.id;
            this.name = publisher.name;
        }
    }

}