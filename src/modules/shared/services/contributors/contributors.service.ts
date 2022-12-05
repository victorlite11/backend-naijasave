import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongodb';
import { BasicContributorOverseerModel } from 'src/modules/shared/dto/basic-contributor/basic-contributor-dto';
import { SignupRequestDto } from 'src/modules/shared/dto/signup-request/signup-request-dto';
import { IdGenerator } from 'src/modules/shared/helpers/id-generator/id-generator';
import { IFetchContributorsQueries, SMSProforma, IRegisterActionRequest, OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { AccountingService } from 'src/modules/shared/services/accounting/accounting.service';
import { CompanyService } from 'src/modules/shared/services/company/company.service';
import { IdentityService } from 'src/modules/shared/services/identity/identity.service';
import { PrivilegeService } from 'src/modules/shared/services/privilege/privilege.service';
import { SmsMediatorService } from 'src/modules/shared/services/sms-mediator/sms-mediator/sms-mediator.service';
import { ContributorDto, AccountModel, BasicInformationModel, CredentialsModel, LocationModel, ActivitiesModel } from 'src/modules/shared/dto/contributor/contributor-dto';
import { DbMediatorService } from '../db-mediator/db-mediator.service';
import { AdminService } from '../admin/admin.service';
import { CompanyDto } from 'src/modules/shared/dto/company/company-dto';

import * as bcrypt from "bcrypt";
import { passwordHashConstant } from 'src/modules/auth/constants';
import { AdminDto } from 'src/modules/core/dtos/admin/admin';

@Injectable()
export class ContributorsService {
    constructor(
        private identityService: IdentityService,
        private privilegeService: PrivilegeService,
        private accountingService: AccountingService,
        private dbMediatorService: DbMediatorService,
        private companyService: CompanyService,
        private adminsService : AdminService,
        private smsMediatorService: SmsMediatorService
        ) {}

    // fetch contributors
    async fetchContributors(queries: IFetchContributorsQueries): Promise<Array<ContributorDto>> {
        let query: FilterQuery<any> = {};
        // filter contributors based on active status
        if(queries.status) {
            switch (queries.status) {
                case 'active':
                    query["activities.status"] = {$eq: "active"};
                    break;
                case 'inactive':
                    query["activities.status"] = {$eq: "inactive"};
                    break;
                default:
                    break;
            }
        }

        // filter contributors based on identity
        if(queries.identity) {
            switch (queries.identity) {
                case 'super-contributors':
                    query["identity.isSuperContributor"] = {$eq: true}; 
                    break;
                case 'sub-contributors':
                    query["identity.isSubContributor"] = {$eq: true};
                    break;
                case 'investors':
                    query["identity.isInvestor"] = {$eq: true};
                    break;
                case 'contributors':
                    query["identity.isContributor"] = {$eq: true};
                    break;
                default:
                    break;
            }
        }

        // filter contributors based on their overseer
        if(queries.overseer_id) {
            query["basicInformation.overseerId"] = {$eq: queries.overseer_id};
        }

        // construct AND query if their are more than one creteria
        let keys = Object.keys(query);
        let values = Object.values(query);
        let andQueries = [];
        for(let i = 0; i < keys.length; i++) {
            let blankObj = {};
            blankObj[`${keys[i]}`] = values[i];

            andQueries.push(blankObj);
            blankObj = {};
        }

        let andQuery: FilterQuery<any> = {$and:andQueries}

        try {
            if(andQueries.length > 0) {
                return await this.dbMediatorService.fetchAll<ContributorDto>(
                    andQuery, {
                        db : "naijasave",
                        collection : "contributors"
                    }
                )
            } else {
                return await this.dbMediatorService.fetchAll(query, {
                    db : "naijasave",
                    collection : "contributors"
                });
            } 
        } catch(e) {
            throw e;
        }


    }

    // fetch contributor
    async fetchContributor(id: string): Promise<ContributorDto> {
        let contributor: ContributorDto;

        try {
            contributor = await this.dbMediatorService.fetchOne <ContributorDto> ({_id: id}, {
                db : "naijasave",
                collection : "contributors"
            });  

            
            // get the number of the contributor overseer and update his
            // overseer id to enable him see the phone number of his overseer

            if(contributor) {
                let contributorOverseerId = contributor.basicInformation.overseerId;
                let overseer : AdminDto | ContributorDto = await this.dbMediatorService.fetchOne <AdminDto> ({_id : contributorOverseerId}, {
                    db : "naijasave",
                    collection : "admins"
                });

                if(!overseer) {
                    // overseer is a contributor
                    overseer = await this.dbMediatorService.fetchOne <ContributorDto> ({_id : contributorOverseerId}, {
                        db : "naijasave",
                        collection : "contributors"
                    })
                }

                if(!overseer) {
                    // there's no overseer, hence get the HeadAdmin and also make the admin the contributor's overseer
                    overseer = await this.adminsService.getHeadAdmin() as AdminDto
                    await this.dbMediatorService.updateOne <ContributorDto> (
                        {_id : contributor._id},
                        {$set : {"basicInformation.overseerId" : overseer._id}},
                        {collection : "contributors", db : "naijasave"}
                    )
                }

                contributor.basicInformation.overseerId = `${overseer.basicInformation.name.split(/\s/)[0]} (${overseer.credentials.phoneNumber})`

                return contributor;  
            }
        } catch(e) {
            throw e;
        }

    }

    async getContributorOverseer(contributor_id: string) : Promise<BasicContributorOverseerModel> {
        
        try {
            let contributor = await this.dbMediatorService.fetchOne <ContributorDto> ({_id : contributor_id}, {
                db : "naijasave",
                collection : "contributors"
            });
    
            let contributorOverseerDetails = new BasicContributorOverseerModel();
            if(contributor) {
                let contributorOverseerId = contributor.basicInformation.overseerId;
                let adminOverseer = await this.dbMediatorService.fetchOne <AdminDto> ({_id : contributorOverseerId}, {
                    db : "naijasave",
                    collection : "admins"
                });

                if(adminOverseer) {
                    contributorOverseerDetails.name = adminOverseer.basicInformation.name;
                    contributorOverseerDetails.identity = "admin";
                    contributorOverseerDetails.username = adminOverseer.credentials.username;
                    contributorOverseerDetails._id = adminOverseer._id;
                } else {
                    // probably a super contributor or sub contributor
                    let contributorOverseer = await this.dbMediatorService.fetchOne <ContributorDto> ({_id: contributorOverseerId}, {
                        collection : "contributors",
                        db : "naijasave"
                    });
    
                    if(contributorOverseer) {
                        contributorOverseerDetails.name = contributorOverseer.basicInformation.name;
                        contributorOverseerDetails.identity = "contributor";
                        contributorOverseerDetails.phoneNumber = contributorOverseer.credentials.phoneNumber;
                        contributorOverseerDetails._id = contributorOverseer._id;
                        contributorOverseerDetails.status = contributorOverseer.activities.status;
                    }
                }
                return contributorOverseerDetails;
            }
        } catch (e) {
            throw e;
        }
    }

    async changeUsername(id: string, username: string, sms?: SMSProforma): Promise<boolean> {
        await this.dbMediatorService.updateOne <ContributorDto> (
            {_id: id},
            {$set: {"credentials.username": username}}, {
                collection : "contributors",
                db : "naijasave"
            }
        )

        if(sms) {
            await this.smsMediatorService.sendAccountChangeSMS(id, sms); // notify the contributor with sms
        }

        return true;
    }

    async changeOverseerIds() {
        const headAdmin = await this.adminsService.getHeadAdmin()

        await this.dbMediatorService.updateOne <ContributorDto> ({}, {
            $set : {"account.totalWithdrawn" : "0"}
        }, {
            db : "naijasave",
            collection : "contributors"
        })
    }
 
    async changeOverseer(contributor_id: string, new_overseer_id: string): Promise<OperationFeedback> {
        // check if user with new_overseer_id exists
        if(!(await this.adminsService.fetchAdmin(new_overseer_id))) {
            if(!(await this.fetchContributor(contributor_id))) {
                throw new HttpException("No Admin or Contributor with the provided ID", HttpStatus.BAD_REQUEST);
            }
        }

        return await this.dbMediatorService.updateOne <ContributorDto> (
            {_id: contributor_id},
            {$set: {"basicInformation.overseerId": new_overseer_id}}, {
                collection : "contributors",
                db : "naijasave"
            }
        ).then(r => {
            if (r.success) {
                return {
                    success : true,
                    message : "Overseer changed successfully"
                };
            } else {
                return {
                    success : false,
                    message : "Could not change overseer"
                };
            }
        })


    }

    // delete contributor
    async deleteContributor(id: string): Promise<boolean> {
        await this.dbMediatorService.deleteOne <ContributorDto> ({_id: id}, {
            collection : "contributors",
            db : "naijasave"
        });
        return true;
    }

    // register contributor action
    async registerContributorAction(payload: IRegisterActionRequest) {
        // update the action for the contributor in the db;
        await this.dbMediatorService.updateOne <ContributorDto> ({_id: payload._id }, {$push: {"activities.actions": payload.newAction}}, {
            db : "naijasave",
            collection : "contributors"
        })
    }

    // update contributor account
    async updateContributorAccount(payload: {_id: string, account: AccountModel}) {
        await this.dbMediatorService.updateOne({_id: payload._id}, {$set: {"account.balance": payload.account.balance}}, {
            db : "naijasave",
            collection : "contributors"
        });
    }
 
    // create contributor
    async createNewContributor(signupRequest: SignupRequestDto) {
        
        let newContributor = new ContributorDto(); // initial object
 
        // set Id
        newContributor._id = signupRequest._id;

        // set referral code
        newContributor.referral.code = String(IdGenerator.generateReferralCode(9999999))

        // set basic information
        await this.setBasicInfo(newContributor.basicInformation, signupRequest);

        // set credentials
        this.setCredentials(newContributor.credentials, signupRequest);

        // set location
        this.setLocation(newContributor.location, signupRequest);

        // define identity
        switch (signupRequest.accountType) {
            case 'investor':
                newContributor.identity = this.identityService.makeInvestor(newContributor.identity);
                break;
            default:
                newContributor.identity = this.identityService.makeContributor(newContributor.identity);
                break;
        }

        // define privilage
        newContributor.privilege = this.privilegeService.toggleContributorWithdrawalAbility(newContributor.privilege);
        newContributor.privilege = this.privilegeService.toggleContributorDepositingAbility(newContributor.privilege);

        switch (signupRequest.accountType) {
            case 'investor':
                newContributor.privilege = this.privilegeService.toggleContributorDepositingAnyAmountAbility(newContributor.privilege);
                newContributor.privilege = this.privilegeService.toggleContributorChangingDailyDepositAbility(newContributor.privilege);
                newContributor.privilege = this.privilegeService.toggleContributorWithdrawingWhileImmatureAbility(newContributor.privilege);
                break;
            default:
                break;
        }

        // define activities and actions
        this.defineActivities(newContributor.activities, signupRequest);

        // define account
        newContributor.account.balance = 0;
        newContributor.account.dailySavings = signupRequest.dailySavings

        newContributor.account.commission = {
            balance : 0
        }

        // insert contributor
        await this.dbMediatorService.insertOne <ContributorDto> (newContributor, {
            db : "naijasave",
            collection : "contributors"
        });
                                                    
        // remove signupRequest
        await this.dbMediatorService.deleteOne <SignupRequestDto> ({_id: signupRequest._id}, {
            db : "naijasave",
            collection : "signup_requests"
        });

        // let company = await this.dbMediatorService.fetchOne <CompanyDto> (
        //     {"credentials.password": "bbC"},
        //     {collection: "company", db: "naijasave"}
        // );

        // if(company.settings.signupRequestsApprovalSMSNotification) {
        //    await this.smsMediatorService.sendSignupRequestApprovalSMS(signupRequest); 
        // }
        
    }

    async updateDatabase() : Promise<number> {
        const allContributors = await this.dbMediatorService.fetchAll <AdminDto> (
            {}, {db: "naijasave", collection: "admins"}
        );

        let successfulUpdate = 0;

        for(let i = 0; i < allContributors.length; i++) {
            let c = allContributors[i] as any;
            console.log(c._id)
            successfulUpdate += 1;
            await this.dbMediatorService.updateOne <any> (
                {_id: c._id},
                {
                    $set: {account : {
                        balance: Number(c.account.balance),
                        commission : {
                            balance : 0
                        },
                        dailySavings: 100, // just to match contributor account interface
                        bankDetails: c.account.bankDetails
                    }
            }}, {db: "naijasave", collection: "admins"}
                ).then(r => {
                    successfulUpdate += 1;
                })
        }
        console.log(successfulUpdate)



        

        return successfulUpdate
    }

    // little methods below (all methods mutate first parameter object)

    private async setBasicInfo(basicInformation: BasicInformationModel, signupRequest: SignupRequestDto) {

        basicInformation.age = Number(signupRequest.age);
        basicInformation.dateOfBirth = signupRequest.dateOfBirth || "";
        basicInformation.gender = signupRequest.gender;
        basicInformation.name = signupRequest.name;
        basicInformation.nextOfKin = signupRequest.nextOfKin;
        basicInformation.overseerId = signupRequest.overseerId;
        if(!signupRequest.overseerId || signupRequest.overseerId.length < 4) {
            basicInformation.overseerId = (await this.adminsService.getHeadAdmin())._id; // Id of HEAD Admin
        }
        basicInformation.referralCode = signupRequest.referrer || "";
    }

    private async setCredentials(credentials: CredentialsModel, signupRequest: SignupRequestDto) {
        credentials.email = signupRequest.email;
        credentials.password = await bcrypt.hash(signupRequest.password, passwordHashConstant.saltOrRounds);
        credentials.phoneNumber = signupRequest.phoneNumber;
        credentials.username = signupRequest.username;
    }

    private setLocation(location: LocationModel, signupRequest: SignupRequestDto) {
        location.address = signupRequest.address;
        location.country = signupRequest.country;
        location.localGovernment = signupRequest.localGovernment;
        location.state = signupRequest.state;
    }

    private defineActivities(activities: ActivitiesModel, signupRequest: SignupRequestDto) {
        let now = new Date().toISOString();
        activities.status = 'active';
        activities.regDate = signupRequest.regDate;
        activities.approvalDate = now;
        activities.lastLogin = activities.regDate;
    }
}
