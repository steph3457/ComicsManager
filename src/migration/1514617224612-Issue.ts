import {MigrationInterface, QueryRunner} from "typeorm";

export class Issue1514617224612 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
    }

}
