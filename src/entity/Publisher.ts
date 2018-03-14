import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Comic } from "./Comic";

@Entity()
export class Publisher {
    @PrimaryGeneratedColumn() id: number;
    @Column({ default: "" })
    api_detail_url: string;
    @Column({ default: 0, unique: true })
    comicVineId: number;
    @Column({ default: "", unique: true })
    name: string;

    @OneToMany(type => Comic, comic => comic.publisher, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    comics: Comic[];

    constructor(publisher: Publisher) {
        if (publisher) {
            this.api_detail_url = publisher.api_detail_url;
            this.comicVineId = publisher.id;
            this.name = publisher.name;
        }
    }
}
