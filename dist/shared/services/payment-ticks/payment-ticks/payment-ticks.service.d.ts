import { ITickOptions, OperationFeedback } from 'src/shared/interface/shared-interfaces';
import { ContributorsService } from '../../contributors/contributors.service';
import { DbMediatorService } from '../../db-mediator/db-mediator.service';
export declare class PaymentTicksService {
    private contributorService;
    private dbMediatorService;
    constructor(contributorService: ContributorsService, dbMediatorService: DbMediatorService);
    tick(contributor_id: string, transaction_id: string, options: ITickOptions): Promise<OperationFeedback>;
    private monthTick;
    private yearTick;
    private dayTick;
}
