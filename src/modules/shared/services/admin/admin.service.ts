import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongodb';
import { AdminDto, AdminAccountModel, AdminIdentityModel } from 'src/modules/shared/dto/admin/admin-dto';
import { NewAdminDto } from 'src/modules/shared/dto/new-admin/new-admin-dto';
import { IdGenerator } from 'src/modules/shared/helpers/id-generator/id-generator';
import { IRegisterActionRequest, OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { AccountingService } from 'src/modules/shared/services/accounting/accounting.service';
import { IdentityService } from 'src/modules/shared/services/identity/identity.service';
import { PrivilegeService } from 'src/modules/shared/services/privilege/privilege.service';
import { QualificationService } from 'src/modules/shared/services/qualification/qualification.service';
import { DbMediatorService } from '../db-mediator/db-mediator.service';

import * as bcrypt from "bcrypt";
import { passwordHashConstant } from 'src/modules/auth/constants';

@Injectable()
export class AdminService {
    constructor(
        private dbMediatorService: DbMediatorService,
        private identityService: IdentityService,
        private accountingService: AccountingService,
        private privilegeService: PrivilegeService,
        private qualificationService: QualificationService
    ) {}

    async fetchAdmin(id: string): Promise<AdminDto> {
        return await this.dbMediatorService.fetchOne <AdminDto> (
            {_id: id},
            {collection : "admins", db : "naijasave"}
        );
    }

    async fetchAdmins(query: FilterQuery<AdminDto>): Promise<AdminDto[]> {
        return await this.dbMediatorService.fetchAll <AdminDto> (
            query,
            {collection : "admins", db : "naijasave"}
        );
    }

    // register contributor action
    async registerAdminAction(payload: IRegisterActionRequest) {
        // update the action for the contributor in the db;
        await this.dbMediatorService.updateOne({_id: payload._id }, {$push: {"activities.actions": payload.newAction}}, {
            collection : "admins",
            db : "naijasave"
        })

    }

    // update admin account
    async updateAdminAccount(payload: {_id: string, account: AdminAccountModel}) {
        
        // use session here instead

        await this.dbMediatorService.updateOne <AdminDto> ({_id: payload._id}, {$set: {"account.balance": payload.account.balance}}, {
            db : "naijasave",
            collection : "admins"
        });

    }

    async createAdmin(payload: NewAdminDto): Promise<OperationFeedback> {
        let newAdmin = new AdminDto();
        let headAdmin = await this.getHeadAdmin();

        // check if admin with same credentials already exists
        // using phone number
        let search = await this.dbMediatorService.fetchOne <AdminDto> ({"credentials.phoneNumber": payload.phoneNumber}, {
            db : "naijasave",
            collection : "admins"
        });
        if(search) {
            throw new HttpException("Admin already exists", HttpStatus.BAD_REQUEST);
        }
        // using email
        search = await this.dbMediatorService.fetchOne <AdminDto> ({"credentials.email": payload.email}, {
            db : "naijasave",
            collection : "admins"
        });
        if(search) {
            throw new HttpException("Admin already exists", HttpStatus.BAD_REQUEST);
        }

        // set basic information first
        newAdmin._id = IdGenerator.generateAdminKey(40);
        newAdmin.basicInformation.name = payload.name;
        newAdmin.basicInformation.dateOfBirth = payload.dateOfBirth;
        newAdmin.basicInformation.gender = payload.gender;
        newAdmin.basicInformation.overseerId = payload.overseer_id || headAdmin._id; // head admin id
        newAdmin.credentials.email = payload.email || "";
        newAdmin.credentials.password = await bcrypt.hash(payload.password, passwordHashConstant.saltOrRounds);
        newAdmin.credentials.phoneNumber = payload.phoneNumber;
        newAdmin.credentials.username = this.constructAdminUsername(payload.name,payload.identity);
        newAdmin.location.country = payload.country;
        newAdmin.location.state = payload.state;
        newAdmin.location.localGovernment = payload.localGovernment;
        newAdmin.location.address = payload.address;

        // head admin cannot be more than one
        if(payload.identity == "head") {
            let headAdmins = await this.dbMediatorService.fetchAll <AdminDto> ({"identity.isHeadAdmin": true}, {
                collection : "admins",
                db : "naijasave"
            });
            if(headAdmins.length > 0) {
               throw new HttpException("Head Admin cannot be more than one", HttpStatus.BAD_REQUEST); 
            }   
        }

        newAdmin.identity = this.assignIdentity(newAdmin.identity, payload.identity);
        newAdmin.privilege = this.privilegeService.newAdminPrivilege(payload.identity);

        payload.overseer_id = payload.overseer_id || headAdmin._id;

        if(payload.overseer_id) {
            let overseer = await this.fetchAdmin(payload.overseer_id);
            await this.qualificationService.hasEnoughBalance(payload.starting_balance, overseer.account);

            // remove amount from overseer account
            let modifiedAccount = this.accountingService.minusBalance({account: overseer.account, amount: payload.starting_balance});
            await this.dbMediatorService.updateOne <AdminDto> (
                {_id: payload.overseer_id},
                {$set: {account: modifiedAccount as AdminAccountModel}}, {
                    db : "naijasave",
                    collection : "admins"
                }
            )
        }


        newAdmin.account = this.accountingService.openAdminAccount({balance: payload.starting_balance, account: newAdmin.account});

        await this.dbMediatorService.insertOne <AdminDto> (newAdmin, {
            db : "naijasave",
            collection : "admins"
        });

        return {success: true, message: "created successfully"}
    }

    async getHeadAdmin(): Promise<AdminDto> {
        return await this.dbMediatorService.fetchOne <AdminDto>({"identity.isHeadAdmin": true}, {
            db : "naijasave",
            collection : "admins"
        });
    }

    private constructAdminUsername(name: string, identity: "super" | "sub" | "head"): string {
        return "admin-" + `${identity}-` + `${name.split(/\s/)[0]}-` + `${IdGenerator.getRand(9999)}`
    }

    private assignIdentity(identityObj: AdminIdentityModel, identityString: "super" | "sub" | "head"): AdminIdentityModel {
        let newIdentity = {...identityObj};
        switch (identityString) {
            case "head":
                newIdentity = this.identityService.makeHeadAdmin(newIdentity);
                break;
            case "sub":
                newIdentity = this.identityService.makeSubAdmin(newIdentity);
                break;
            case "super":
                newIdentity = this.identityService.makeSuperAdmin(newIdentity);
                break;
            default:
                newIdentity = this.identityService.makeSubAdmin(newIdentity);
                break;
        }

        return newIdentity;
    }
}
