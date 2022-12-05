import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AdminAccountModel } from 'src/modules/shared/dto/admin/admin-dto';
import { CompanyAccountModel } from 'src/modules/shared/dto/company/company-dto';
import { AccountModel, ReferralModel } from 'src/modules/shared/dto/contributor/contributor-dto';
import { EntityIdentity, ICalcAccount, IOpenAccount, IOpenAdminAccount, ITakeAmoutInFromAccountAndAddInToAccount } from 'src/modules/shared/interface/shared-interfaces';

@Injectable()
export class AccountingService {

    // Balance Accounting

    plusBalance(payload: ICalcAccount): AccountModel | AdminAccountModel {
        if(isNaN(Number(payload.amount))) {
            throw new HttpException(`Invalid amount provided (${payload.amount})`, HttpStatus.BAD_REQUEST);
        }
        payload.account = this.createUniqueAccountFrom(payload.account);
        payload.account.balance = Number(payload.account.balance) + Number(payload.amount);

        return payload.account;
    }

    minusBalance(payload: ICalcAccount): AccountModel | AdminAccountModel {
        // check if amount is valid or not
        if(isNaN(Number(payload.amount))) {
            throw new HttpException(`Invalid amount provided (${payload.amount})`, HttpStatus.BAD_REQUEST);
        }

        payload.account = this.createUniqueAccountFrom(payload.account);
        payload.account.balance = Number(payload.account.balance) - Number(payload.amount);

        return payload.account;
    }

    debitAvailTradingBalance(payload: {amount: number, account: CompanyAccountModel}): CompanyAccountModel {
        // check if amount is valid or not
        if(isNaN(Number(payload.amount))) {
            throw new HttpException(`Invalid amount provided (${payload.amount})`, HttpStatus.BAD_REQUEST);
        }

        // check if TradingBalance has enough balance
        if(Number(payload.amount) > Number(payload.account.availableTradingBalance)) {
            throw new HttpException(`Insufficient Balance`, HttpStatus.BAD_REQUEST);  
        }

        payload.account.availableTradingBalance = Number(payload.account.availableTradingBalance) - Number(payload.amount)
        
        return payload.account;
    }

    creditAvailTradingBalance(payload: {amount: number, account: CompanyAccountModel}): CompanyAccountModel {
        // check if amount is valid or not
        if(isNaN(Number(payload.amount))) {
            throw new HttpException(`Invalid amount provided (${payload.amount})`, HttpStatus.BAD_REQUEST);
        }

        payload.account.availableTradingBalance = Number(payload.account.availableTradingBalance) + Number(payload.amount)
        
        return payload.account;
    }

    updateTradingBalance(payload: {amount: number, account: CompanyAccountModel}): CompanyAccountModel {
        // check if amount is valid or not
        if(isNaN(Number(payload.amount))) {
            throw new HttpException(`Invalid amount provided (${payload.amount})`, HttpStatus.BAD_REQUEST);
        }

        payload.account.availableTradingBalance = Number(payload.account.availableTradingBalance) + (Number(payload.amount) - Number(payload.account.tradingBalance))
        payload.account.tradingBalance = Number(payload.amount)
        
        return payload.account;
    }

    // inter-maths

    takeAmoutInFromAccountAndAddInToAccount(payload: ITakeAmoutInFromAccountAndAddInToAccount): ITakeAmoutInFromAccountAndAddInToAccount {
        // deduct amount in from-account balance and also add it to it's withdrawalBalance
        payload.from.account = this.minusBalance({
            account: payload.from.account,
            amount: payload.amount
        });

        // add amount in to-account balance and also add it to it's depositBalance
        payload.to.account = this.plusBalance({
            account: payload.to.account,
            amount: payload.amount
        });

        return payload;
    }

    // Open Account

    openAccount(payload: IOpenAccount): AccountModel {
        payload.account = <AccountModel>this.createUniqueAccountFrom(payload.account);
        
        if(payload.dailySavings) {
            payload.account.dailySavings = payload.dailySavings;
        } else {
            payload.account.dailySavings = 100;
        }
        
        // initial opening balance
        if (payload.balance) {
            payload.account.balance = payload.balance;
        } else {
           payload.account.balance = 0;
        }

        return payload.account
    }

    openAdminAccount(payload: IOpenAdminAccount): AdminAccountModel {
        payload.account = <AdminAccountModel>{...payload.account};
        
        
        // initial opening balance
        if (payload.balance) {
            payload.account = this.plusBalance({account: payload.account, amount: payload.balance}) as AdminAccountModel;
        } else {
           payload.account.balance = 0;
        }

        return payload.account
    }

    private createUniqueAccountFrom(account: AccountModel | AdminAccountModel): AccountModel | AdminAccountModel {
        return {...account}
    }
}
