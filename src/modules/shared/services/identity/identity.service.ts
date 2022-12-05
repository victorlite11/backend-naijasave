import { Injectable } from '@nestjs/common';
import { AdminDto, AdminIdentityModel } from 'src/modules/shared/dto/admin/admin-dto';
import { ContributorDto, IdentityModel } from 'src/modules/shared/dto/contributor/contributor-dto';
import { IdGenerator } from 'src/modules/shared/helpers/id-generator/id-generator';
import { EntityIdentity } from 'src/modules/shared/interface/shared-interfaces';
import { AdminService } from '../admin/admin.service';
import { DbMediatorService } from '../db-mediator/db-mediator.service';
import { EntitiesMediatorService } from '../entities-mediator/entities-mediator/entities-mediator.service';
import { PrivilegeService } from '../privilege/privilege.service';

@Injectable()
export class IdentityService {
    constructor(
        private dbMediatorService: DbMediatorService,
        private privilegeService: PrivilegeService
    ) {}

    async fetchContributorIdentity(contributor_id: string): Promise<IdentityModel> {
        return await this.dbMediatorService.fetchContributorIdentity(contributor_id);
    }

    async fetchAdminIdentity(admin_id: string): Promise<AdminIdentityModel> {
        let admin = await this.dbMediatorService.fetchAdmin({_id: admin_id});
        return admin.identity;
    }

    async changeAdminIdentity(
        admin_id: string,
        interested_identity: {interested_identity: "super" | "sub" | "head"}
    ): Promise<{success: boolean, message: string}> {
        let newIdentity = new AdminIdentityModel();
        switch (interested_identity.interested_identity) {
            case "head":
                newIdentity = this.makeHeadAdmin(newIdentity);
                break;
            case "sub":
                newIdentity = this.makeSubAdmin(newIdentity);
                break;
            case "super":
                newIdentity = this.makeSuperAdmin(newIdentity);
                break;
            default:
                break;
        }

        let admin = await this.dbMediatorService.fetchAdmin({_id: admin_id});
        let newUsername = this.constructAdminUsername(admin, interested_identity.interested_identity);

        // register action for entity
        await this.dbMediatorService.registerAdminAction({
            _id: IdGenerator.generateKey(25),
            identity: EntityIdentity.ADMIN,
            newAction: {
                description: `account type changed to ${interested_identity.interested_identity}`,
                date: new Date().toISOString(),
                type: {
                    is: "AccountTypeChange"
                }
            }
        });

        // change privilege as well
        let newPrivilege = this.privilegeService.newAdminPrivilege(interested_identity.interested_identity);

        return await this.dbMediatorService.updateAdmin(
            {_id: admin_id},
            {$set: {"identity": newIdentity}}
        ).then( async _ => {
            return await this.dbMediatorService.updateAdmin(
                {_id: admin_id},
                {$set: {"credentials.username": newUsername}} 
            ).then(async _ => {
                return await this.dbMediatorService.updateAdmin(
                    {_id: admin_id},
                    {$set: {"privilege": newPrivilege}} 
                )
            })
        });
    }

    private constructAdminUsername(admin: AdminDto, interested_identity: "super" | "sub" | "head"): string {
        let username = "admin";
        username += "-";
        username += interested_identity.toLocaleLowerCase();
        username += "-";
        username += admin.basicInformation.name.split(/\s/)[0];
        username += "-";
        username += IdGenerator.getRand(9999);
        
        return username;
    }

    async changeContributorIdentity(
        contributor_id: string,
        interested_identity: {interested_identity: "super" | "sub" | "investor" | "contributor"}
    ): Promise<{success: boolean, message: string}> {
        let newIdentity = new IdentityModel();
        let shouldRevertSubordinates = false;
        switch (interested_identity.interested_identity) {
            case "contributor":
                newIdentity = this.makeContributor(newIdentity);
                shouldRevertSubordinates = true;
                break;
            case "investor":
                newIdentity = this.makeInvestor(newIdentity);
                shouldRevertSubordinates = true;
                break;
            case "sub":
                newIdentity = this.makeSubContributor(newIdentity);
                break;
            case "super":
                newIdentity = this.makeSuperContributor(newIdentity);
                break;
            default:
                break;
        }

        let c = await this.dbMediatorService.fetchContributor({_id: contributor_id});

        // register action for entity
        await this.dbMediatorService.registerContributorAction({
            _id: IdGenerator.generateKey(25),
            identity: EntityIdentity.CONTRIBUTOR,
            newAction: {
                description: `account type changed to ${interested_identity.interested_identity}`,
                date: new Date().toISOString(),
                type: {
                    is: "AccountTypeChange"
                }
            }
        });

        if(shouldRevertSubordinates && (c.identity.isSubContributor || c.identity.isSuperContributor)) {
            
            // fetch all his subordinates
            let s = await this.dbMediatorService.fetchContributors({"basicInformation.overseerId": contributor_id});

            // get the headAdmin and change all the subject's subordinates overseer id to admin's
            let headAdmin = await this.dbMediatorService.fetchAdmin({"identity.isHeadAdmin": true});
            await s.forEach(async subordinate => {
                await this.dbMediatorService.updateContributorReferral(
                    {
                    _id: subordinate._id
                    },
                    {
                        $set: {"basicInformation.overseerId": headAdmin._id}
                    }
                )
            });
        }

        return await this.dbMediatorService.updateContributor(
            {_id: contributor_id},
            {$set: {"identity": newIdentity}}
        )
    }







    // for admin
    makeHeadAdmin(identity: AdminIdentityModel): AdminIdentityModel {
        // create new object from identity to avoid mutation
        identity = {...identity};

        // if isSuper or isSub, change back to false
        identity.isSuperAdmin = false;
        identity.isSubAdmin = false;
        identity.isFeebleAdmin = false;

        identity.isHeadAdmin = true;

        return identity;
    }

    makeSuperAdmin(identity: AdminIdentityModel): AdminIdentityModel {
        // create new object from identity to avoid mutation
        identity = {...identity};

        // if isSuper or isSub, change back to false
        identity.isSuperAdmin = true;
        identity.isSubAdmin = false;
        identity.isFeebleAdmin = false;

        identity.isHeadAdmin = false;

        return identity;
    }

    makeSubAdmin(identity: AdminIdentityModel): AdminIdentityModel {
        // create new object from identity to avoid mutation
        identity = {...identity};

        // if isSuper or isSub, change back to false
        identity.isSuperAdmin = false;
        identity.isSubAdmin = true;
        identity.isFeebleAdmin = false;

        identity.isHeadAdmin = false;

        return identity;
    }

    makeFeebleAdmin(identity: AdminIdentityModel): AdminIdentityModel {
        // create new object from identity to avoid mutation
        identity = {...identity};

        // if isSuper or isSub, change back to false
        identity.isSuperAdmin = false;
        identity.isSubAdmin = false;
        identity.isFeebleAdmin = true;

        identity.isHeadAdmin = false;

        return identity;
    }

    // for contributors

    makeInvestor(identity: IdentityModel): IdentityModel {
        // create new object from identity to avoid mutation
        identity = this.createUniqueIdentityFrom(identity);

        // if isSuper or isSub, change back to false
        identity = this.revokePrivilege(identity);

        identity.isContributor = false;
        identity.isInvestor = true;

        return identity;
    }

    makeContributor(identity: IdentityModel): IdentityModel {
        // create new object from identity to avoid mutation
        identity = this.createUniqueIdentityFrom(identity);

        // if isSuper or isSub, change back to false
        identity = this.revokePrivilege(identity);

        identity.isContributor = true;
        identity.isInvestor = false;

        return identity;
    }
 
    makeSuperContributor(identity: IdentityModel): IdentityModel {
        // create new object from identity to avoid mutation
        identity = this.createUniqueIdentityFrom(identity);

        // Normal Identities: isInvestor & isContributor
        identity = this.turnOffNormalIdentities(identity);

        identity.isSuperContributor = true;
        identity.isSubContributor = false;

        return identity;
    }

    makeSubContributor(identity: IdentityModel): IdentityModel {
        // create new object from identity to avoid mutation
        identity = this.createUniqueIdentityFrom(identity);

        // Normal Identities: isInvestor & isContributor
        identity = this.turnOffNormalIdentities(identity);

        identity.isSuperContributor = false;
        identity.isSubContributor = true;

        return identity;
    }

    revokePrivilege(identity: IdentityModel): IdentityModel {
        // create new object from identity to avoid mutation
        identity = this.createUniqueIdentityFrom(identity);

        identity.isSuperContributor = false;
        identity.isSubContributor = false;

        if(identity.wasContributor) {
            identity.isContributor = true;
            identity.wasContributor = false;
        }

        if(identity.wasInvestor) {
            identity.isInvestor = true;
            identity.wasInvestor = false;
        }

        return identity;
    }

    // Normal Identities: isInvestor & isContributor
    private turnOffNormalIdentities(identity: IdentityModel): IdentityModel {
        // create new object from identity to avoid mutation
        identity = this.createUniqueIdentityFrom(identity);

        // update wasContributor
        if(identity.isContributor) {
            identity.wasContributor = true;
        }

        // update wasInvestor
        if(identity.isInvestor) {
            identity.wasInvestor = true;
        }

        // turn is identities
        identity.isContributor = false;
        identity.isInvestor = false;

        return identity;
    }

    private createUniqueIdentityFrom(identity: IdentityModel): IdentityModel {
        return {...identity};
    }
}
