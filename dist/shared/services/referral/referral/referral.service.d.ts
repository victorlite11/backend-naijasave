import { BasicContributorDto } from 'src/modules/shared/dto/basic-contributor/basic-contributor-dto';
import { ContributorsService } from '../../contributors/contributors.service';
import { DbMediatorService } from '../../db-mediator/db-mediator.service';
import { Feedback } from 'src/modules/core/misc/models.core/models.core';
import { TransactionsService } from '../../transactions/transactions.service';
import { ReferralData } from 'src/modules/shared/interface/shared-interfaces';
export declare class ReferralService {
    private contributorsService;
    private transactionsService;
    private dbMediatorService;
    constructor(contributorsService: ContributorsService, transactionsService: TransactionsService, dbMediatorService: DbMediatorService);
    fetchReferred(referralCode: string): Promise<BasicContributorDto[]>;
    payReferralCommission(op: {
        contributorId: string;
        amount: number;
    }): Promise<Feedback<string>>;
    constructAndReturnReferralData(op: {
        contributor_id: string;
    }): Promise<ReferralData>;
}
