import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AdminAccountModel, AdminPrivilegeModel } from 'src/modules/shared/dto/admin/admin-dto';
import { AccountModel, PrivilegeModel } from 'src/modules/shared/dto/contributor/contributor-dto';
import { EntityIdentity } from 'src/modules/shared/interface/shared-interfaces';
import { DbMediatorService } from '../db-mediator/db-mediator.service';

@Injectable()
export class QualificationService {
    constructor(private dbMediatorService: DbMediatorService) {}

    async hasEnoughBalance(amount: number, account: AdminAccountModel | AccountModel) {
        let amt = Number(amount);
        let balance = Number(account.balance);

        if(balance < amt) {
            throw new HttpException("Insufficient Balance", HttpStatus.BAD_REQUEST);
        }
    }

    async canCreditOthers(entity: EntityIdentity, privilege: AdminPrivilegeModel | PrivilegeModel) {
        if(entity == EntityIdentity.ADMIN) {
            privilege = <AdminPrivilegeModel>privilege;

            if(!privilege.canCreditOthers) {
                throw new HttpException("Cannot credit others", HttpStatus.BAD_REQUEST);
            }

        } else {
            privilege = <PrivilegeModel>privilege;

            if(!privilege.canDepositSubordinates) {
                throw new HttpException("Cannot credit subordinates", HttpStatus.BAD_REQUEST);
            }

        }
    }

    async canDebitOthersWithoutChecks(entity: EntityIdentity, privilege: AdminPrivilegeModel | PrivilegeModel) {
        if(entity == EntityIdentity.ADMIN) {
            privilege = <AdminPrivilegeModel>privilege;

            if(!privilege.canDebitOthersWithoutChecks) {
                throw new HttpException("Cannot debit others", HttpStatus.BAD_REQUEST);
            }

        } else {
            privilege = <PrivilegeModel>privilege;

            if(!privilege.canWithdrawSubordinates) {
                if(!privilege.canWithdrawSubordinatesWithoutChecks) {
                    throw new HttpException("Cannot debit subordinates", HttpStatus.BAD_REQUEST);
                }
            }

        }
    }

    async canDebitOthersWithChecks(entity: EntityIdentity, privilege: AdminPrivilegeModel | PrivilegeModel) {
        if(entity == EntityIdentity.ADMIN) {
            privilege = <AdminPrivilegeModel>privilege;

            if(!privilege.canDebitOthersWithChecks) {
                throw new HttpException("Cannot debit others", HttpStatus.BAD_REQUEST);
            }

        } else {
            privilege = <PrivilegeModel>privilege;

            if(!privilege.canWithdrawSubordinates) {
                throw new HttpException("Cannot debit subordinates", HttpStatus.BAD_REQUEST);
            }

        }
    }

    async canWithdraw(entity: EntityIdentity, privilege: AdminPrivilegeModel | PrivilegeModel) {
        if(entity == EntityIdentity.ADMIN) {
            privilege = <AdminPrivilegeModel>privilege;

            if(!privilege.canWithdrawSelf) {
                throw new HttpException("Cannot debit this account", HttpStatus.BAD_REQUEST);
            }

        } else {
            privilege = <PrivilegeModel>privilege;

            if(!privilege.canWithdraw) {
                throw new HttpException("Cannot debit this account", HttpStatus.BAD_REQUEST);
            }

        }
    }

    async canDeposit(entity: EntityIdentity, privilege: AdminPrivilegeModel | PrivilegeModel) {
        if(entity == EntityIdentity.ADMIN) {
            privilege = <AdminPrivilegeModel>privilege;

            if(!privilege.canDepositSelf) {
                throw new HttpException("Cannot deposit this account", HttpStatus.BAD_REQUEST);
            }

        } else {
            privilege = <PrivilegeModel>privilege;

            if(!privilege.canDeposit) {
                throw new HttpException("Cannot deposit this account", HttpStatus.BAD_REQUEST);
            }

        }
    } 

    async canMakeWithdrawalRequest(entity: EntityIdentity, privilege: AdminPrivilegeModel | PrivilegeModel) {
        if(entity == EntityIdentity.ADMIN) {
            privilege = <AdminPrivilegeModel>privilege;

            if(!privilege.canPlaceWithdrawalRequest) {
                throw new HttpException("You cannot place withdrawal request", HttpStatus.BAD_REQUEST);
            }

        } else {
            privilege = <PrivilegeModel>privilege;

            if(!privilege.canMakeWithdrawalRequest) {
                throw new HttpException("You cannot place withdrawal request", HttpStatus.BAD_REQUEST);
            }

        }
    }

    async canUseSMS(entity: EntityIdentity, privilege: AdminPrivilegeModel | PrivilegeModel) {
        if(entity == EntityIdentity.ADMIN) {
            privilege = <AdminPrivilegeModel>privilege;

            if(!privilege.canSendSMS) {
                throw new HttpException("You cannot initiate SMS notifications", HttpStatus.BAD_REQUEST);
            }

        } else {
            privilege = <PrivilegeModel>privilege;

            if(!privilege.canUseSMS) {
                throw new HttpException("You cannot initiate SMS notifications", HttpStatus.BAD_REQUEST);
            }

        }
    }

    async canMakeDepositRequest(entity: EntityIdentity, privilege: AdminPrivilegeModel | PrivilegeModel) {
        if(entity == EntityIdentity.ADMIN) {
            privilege = <AdminPrivilegeModel>privilege;

            if(!privilege.canPlaceDepositRequest) {
                throw new HttpException("You cannot place deposit request", HttpStatus.BAD_REQUEST);
            }

        } else {
            privilege = <PrivilegeModel>privilege;

            if(!privilege.canMakeDepositRequest) {
                throw new HttpException("You cannot place deposit request", HttpStatus.BAD_REQUEST);
            }

        }
    }

    async canEditSignupRequest(privilege: AdminPrivilegeModel) {
        if(!privilege.canEditSignupRequestData) {
            throw new HttpException("You cannot edit signup requests", HttpStatus.BAD_REQUEST);
        }
    }

    async canChangeContributorOversser(privilege: AdminPrivilegeModel) {
        if(!privilege.canChangeContributorsOverseer) {
            throw new HttpException("You cannot change contributors' overseers", HttpStatus.BAD_REQUEST);
        }
    }

    async canRemoveContributors(privilege: AdminPrivilegeModel) {
        if(!privilege.canRemoveContributors) {
            throw new HttpException("You cannot delete contributors", HttpStatus.BAD_REQUEST);
        }
    }

    async canWithdrawWhileAccountIsImmature(approvalDate: string, maturityDays: string, privilege: PrivilegeModel) {
        if(!privilege.canWithdrawWhileImmature) {
            await this.accountIsMartured(approvalDate, maturityDays);
        }
    }

    async accountIsMartured(contributorApprovalDate: string, maturityDays: string) {
        // check account maturity

        // use date
        let initDate = "1/1/2020";
        let finalDate = `1/${maturityDays}/2020`;
        let diffMilli = Math.abs(Date.parse(finalDate) - Date.parse(initDate));

        // use diffMilli to check the maturity of contributor account
        let today = Date.now();
        let diff = Math.abs(today - Date.parse(contributorApprovalDate));

        if(diff < diffMilli) {
            throw new HttpException(`You cannot withdraw within ${maturityDays} days of registration`, HttpStatus.BAD_REQUEST);
        }
    }

    async canDepositAnyAmount(amount: number, dailySavings: number, privilege: PrivilegeModel) {
        privilege = <PrivilegeModel>privilege;

        if(!privilege.canDepositAnyAmount) {
            await this.amountEqualsDailySavings(amount, dailySavings);
        }

    }

    async amountEqualsDailySavings(amount: number, dailySavings: number) {
        if(Number(amount) != Number(dailySavings)) {
            throw new HttpException("You cannot deposit any amount other than your daily savings amount", HttpStatus.BAD_REQUEST);
        }
    }

    // request acceptance and rejecting checks
    async canRejectSubordinatesRequests(entity: EntityIdentity, privilege: AdminPrivilegeModel | PrivilegeModel) {
        if(entity == EntityIdentity.ADMIN) {
            privilege = <AdminPrivilegeModel>privilege;

            if(!privilege.canRejectContributorsRequests) {
                throw new HttpException("You cannot Reject Requests (It is advised you forward it to your overseer)", HttpStatus.BAD_REQUEST);
            }

        } else {
            privilege = <PrivilegeModel>privilege;

            if(!privilege.canRejectSubordinatesRequests) {
                throw new HttpException("You cannot Reject Requests (It is advised you forward it to your overseer)", HttpStatus.BAD_REQUEST);
            }

        }
    }

        // request acceptance and rejecting checks
        async canAcceptSubordinatesRequests(entity: EntityIdentity, privilege: AdminPrivilegeModel | PrivilegeModel) {
            if(entity == EntityIdentity.ADMIN) {
                privilege = <AdminPrivilegeModel>privilege;
    
                if(!privilege.canAcceptContributorsRequests) {
                    throw new HttpException("You cannot Accept Requests (It is advised you forward it to your overseer)", HttpStatus.BAD_REQUEST);
                }
    
            } else {
                privilege = <PrivilegeModel>privilege;
    
                if(!privilege.canAcceptSubordinatesRequests) {
                    throw new HttpException("You cannot Accept Requests (It is advised you forward it to your overseer)", HttpStatus.BAD_REQUEST);
                }
    
            }
        }

    // Sign up checks
    
    async alreadyRegistered(phoneNumber?: string, email?: string) {
        if(phoneNumber) {
            let contributor = await this.dbMediatorService.fetchContributor({"credentials.phoneNumber": phoneNumber});
            if(contributor) {
                throw new HttpException("Account already exists", HttpStatus.BAD_REQUEST);
            }
        }

        if(email) {
            let contributor = await this.dbMediatorService.fetchContributor({"credentials.email": email});
            if(contributor) {
                throw new HttpException("Account already exists", HttpStatus.BAD_REQUEST);
            }  
        }
    }

    async awaitingApproval(phoneNumber?: string, email?: string) {
        if(phoneNumber) {
            let request = await this.dbMediatorService.fetchSignupRequest({"phoneNumber": phoneNumber})

            if(request) {
                throw new HttpException("Signup request is under approval", HttpStatus.BAD_REQUEST);
            }
        }

        if(email) {
            let request = await this.dbMediatorService.fetchSignupRequest({"email": email})

            if(request) {
                throw new HttpException("Signup request is under approval", HttpStatus.BAD_REQUEST);
            }
        }
    }
}
