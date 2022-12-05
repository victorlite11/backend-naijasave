import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { AdminAccountModel, AdminDto } from 'src/modules/shared/dto/admin/admin-dto';
import { AccountModel, ContributorDto } from 'src/modules/shared/dto/contributor/contributor-dto';
import { EntityIdentity, IFetchEntity, IRegisterActionRequest, IRegisterActionWithoutActionBucket } from 'src/modules/shared/interface/shared-interfaces';
import { DbMediatorService } from '../../db-mediator/db-mediator.service';

@Injectable()
export class EntitiesMediatorService {
    constructor(
        private dbMediatorService: DbMediatorService
    ) {}

    // check entity existence
    async exists(id: string): Promise<Boolean> {
        return await this.isContributor(id).then(async exists => {
            if(exists) {
                return true;
            } else {
                return await this.isAdmin(id).then(async exists => {
                    if(exists) {
                        return true;
                    } else {
                        return false;
                    }
                })
            }
        })
    }

    async isContributor(id: string): Promise<boolean> {
        if(await this.dbMediatorService.fetchContributor({_id: id})) {
            return true;
        } else {
            return false;
        }

    }

    async isAdmin(id: string): Promise<boolean> {
        if(await this.dbMediatorService.fetchAdmin({_id: id})) {
            return true;
        } else {
            return false;
        }

    }

    async fetchEntity(id: string): Promise<IFetchEntity> {
        let entity: AdminDto | ContributorDto;
        let identity: EntityIdentity;
         
        // check if to is admin or not
        if(await this.isAdmin(id)) {
            identity = EntityIdentity.ADMIN;
            entity = await this.dbMediatorService.fetchAdmin({_id: id});
        } else {
            if(await this.isContributor(id)) {
                identity = EntityIdentity.CONTRIBUTOR;
                entity = await this.dbMediatorService.fetchContributor({_id: id});
            } else {
                throw new NotFoundException(`Unable to find entity with id ${id}`)
            }
        }
        
        return {entity: entity, identity: identity};

    }

    async fetchEntityUsingPhoneNumber(phoneNumber: string): Promise<IFetchEntity> {
        let entity: AdminDto | ContributorDto;
        let identity: EntityIdentity;
         
        // fetch from contributors collection
        entity = await this.dbMediatorService.fetchContributor({"credentials.phoneNumber": phoneNumber});
        identity = EntityIdentity.CONTRIBUTOR;

        if(!entity) {
            // fetch from admin collection
            entity = await this.dbMediatorService.fetchAdmin({"credentials.phoneNumber": phoneNumber});
            identity = EntityIdentity.ADMIN
            
            if(!entity) {
                 throw new NotFoundException(`Cannot find user with this phone number ${phoneNumber}`)
            }
        }
        
        return {entity: entity, identity: identity};

    }
 
    // update entity account
    async updateEntityAccount(payload: {_id: string, account: AdminAccountModel | AccountModel}, identity?: EntityIdentity) {
        
        // define identity if it hasnt been defined
        if(!identity) {
            if(this.isAdmin(payload._id)) {
                identity = EntityIdentity.ADMIN
            } else {
                if(this.isContributor(payload._id)) {
                    identity = EntityIdentity.CONTRIBUTOR
                } else {
                    throw new NotFoundException(`Cannot find entity with id ${payload._id}`)
                }
            }
        }

        if(identity == EntityIdentity.CONTRIBUTOR) {
            await this.dbMediatorService.updateContributorAccount({
                _id: payload._id,
                account: <AccountModel>payload.account
            });
        } else {
            // entity is an admin
            await this.dbMediatorService.updateAdminAccount({
                _id: payload._id,
                account: <AdminAccountModel>payload.account
            });
        }
    }

    async registerAction(payload: IRegisterActionRequest) {
        // define identity if it hasnt been defined
        if(!payload.identity) {
            if(this.isAdmin(payload._id)) {
                payload.identity = EntityIdentity.ADMIN
            } else {
                if(this.isContributor(payload._id)) {
                    payload.identity = EntityIdentity.CONTRIBUTOR
                } else {
                    throw new NotFoundException(`Cannot find entity with id ${payload._id}`)
                }
            }
        }

        if(payload.identity == EntityIdentity.ADMIN) {
            this.dbMediatorService.registerAdminAction(payload);
        } else {
            if(payload.identity == EntityIdentity.CONTRIBUTOR) {
                this.dbMediatorService.registerContributorAction(payload);
            }
        }
    }
}
