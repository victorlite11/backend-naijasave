import { AdminAccountModel } from 'src/shared/dto/admin/admin-dto';
import { CompanyAccountModel } from 'src/shared/dto/company/company-dto';
import { AccountModel } from 'src/shared/dto/contributor/contributor-dto';
import { ICalcAccount, IOpenAccount, IOpenAdminAccount, ITakeAmoutInFromAccountAndAddInToAccount } from 'src/shared/interface/shared-interfaces';
export declare class AccountingService {
    plusBalance(payload: ICalcAccount): AccountModel | AdminAccountModel;
    minusBalance(payload: ICalcAccount): AccountModel | AdminAccountModel;
    debitAvailTradingBalance(payload: {
        amount: number;
        account: CompanyAccountModel;
    }): CompanyAccountModel;
    creditAvailTradingBalance(payload: {
        amount: number;
        account: CompanyAccountModel;
    }): CompanyAccountModel;
    updateTradingBalance(payload: {
        amount: number;
        account: CompanyAccountModel;
    }): CompanyAccountModel;
    takeAmoutInFromAccountAndAddInToAccount(payload: ITakeAmoutInFromAccountAndAddInToAccount): ITakeAmoutInFromAccountAndAddInToAccount;
    openAccount(payload: IOpenAccount): AccountModel;
    openAdminAccount(payload: IOpenAdminAccount): AdminAccountModel;
    private createUniqueAccountFrom;
}
