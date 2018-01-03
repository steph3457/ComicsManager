import "reflect-metadata";
import { createConnection } from "typeorm";
import { ComicsLibrary } from "./lib/ComicsLibrary";
import { Comic } from "./entity/Comic";
import { Publisher } from "./entity/Publisher";

createConnection().then(async connection => {

    console.log("Migrate comics library JSON to sqlite database...");

    var comicsLibrary = new ComicsLibrary(true);
    for (const comicName in comicsLibrary.comics) {
        let comic: Comic = comicsLibrary.comics[comicName];
        let comicRepository = connection.getRepository(Comic);
        let publisherRepository = connection.getRepository(Publisher);

        console.log("Processing " + comic.folder_name + "...");

        let comicInDb = await comicRepository.findOne({ folder_name: comic.folder_name });
        if (comicInDb) {
            console.log("Comic already exists: " + comic.folder_name);
            continue;
        }

        if (comic.publisher.comicVineId) {
            let publisher = await publisherRepository.findOne({ comicVineId: comic.publisher.comicVineId });
            if (publisher) {
                comic.publisher = publisher;
            }
        } else {
            comic.publisher = null;
        }
        //console.dir(comic);
        await comicRepository.save(comic);

        console.log("Saved a new comic " + comic.folder_name + " with id: " + comic.id);

    }
}).catch(error => console.log(error));
