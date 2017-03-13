import { Publisher } from "./Publisher";
export class Config {
    comicsPath: string;
    comicVineAPI: string;
    publishers: {[name: string] : Publisher} = {};
    constructor(config:Config) {
        this.comicsPath = config.comicsPath;
        this.comicVineAPI = config.comicVineAPI;
        for(var publisher in config.publishers)
        {
            this.publishers[publisher] = new Publisher(config.publishers[publisher]);
        }
    }

}