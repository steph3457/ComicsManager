import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { Issue } from "./Issue";

@Entity()
export class ReadingStatus {
    @PrimaryGeneratedColumn()
    id: number;
    @OneToOne(type => Issue, issue => issue.readingStatus)
    issue: Issue;
    @Column({ default: false })
    read: boolean;
    @Column({ default: 0 })
    pageCount: number;
    @Column({ default: 0 })
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