import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongodb';
import { AdminDto } from 'src/modules/shared/dto/admin/admin-dto';
import { ContributorDto } from 'src/modules/shared/dto/contributor/contributor-dto';
import { DbMediatorService } from 'src/modules/shared/services/db-mediator/db-mediator.service';

import * as bcrypt from "bcrypt";
import { passwordHashConstant } from 'src/modules/auth/constants';

@Injectable()
export class UsersService {

    constructor(
        private dbMediator: DbMediatorService
    ) {}

    async findOne <T extends AdminDto | ContributorDto> (query: FilterQuery<T>, onlyAdmin: boolean = false) : Promise<T | undefined> {

        let entity : 'admin' | 'contributor' | 'unknown' = 'unknown';
        let user : T = undefined;

        // skip looking up contributors collection if onlyAdmin is true
        if (!onlyAdmin) {
            user = await this.dbMediator.fetchOne <T> (query as T, {collection: "contributors", db: "naijasave"})
        }

        if (user) {
            entity = 'contributor'
        }

        if (!user) {
            user = await this.dbMediator.fetchOne <T> (query as T, {collection: "admins", db: "naijasave"})

            if (user) {
                entity = 'admin'
            }
        }
 
        if (entity == 'contributor') {
            // hash all passwords in the db if they havent been hashed yet
            if (user.credentials.password.length < 10) {
                const passwordHash = await bcrypt.hash(user.credentials.password, passwordHashConstant.saltOrRounds);
                await this.dbMediator.updateOne <ContributorDto> (
                    {_id: user._id},
                    {$set: {"credentials.password": passwordHash}},
                    {collection: "contributors", db: "naijasave"}
                )
                user.credentials.password = passwordHash;
            }
        }

        if (entity == 'admin') {
            // hash all passwords in the db if they havent been hashed yet
            if (user.credentials.password.length < 15) {
                const passwordHash = await bcrypt.hash(user.credentials.password, passwordHashConstant.saltOrRounds);
                await this.dbMediator.updateOne <ContributorDto> (
                    {_id: user._id},
                    {$set: {"credentials.password": passwordHash}},
                    {collection: "admins", db: "naijasave"}
                )
                user.credentials.password = passwordHash;
            } 
        }

        return user;
    }

}
