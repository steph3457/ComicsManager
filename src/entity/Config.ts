import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Config {
    @PrimaryGeneratedColumn() id: number;
    @Column({ default: "" })
    comicsPath: string = "";
    @Column({ default: "" })
    comicVineAPI: string = "";

    constructor() {}
}
