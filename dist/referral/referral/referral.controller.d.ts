import { ReferralService } from 'src/modules/shared/services/referral/referral/referral.service';
import { ReferralData } from 'src/modules/shared/interface/shared-interfaces';
export declare class ReferralController {
    private referralService;
    constructor(referralService: ReferralService);
    getReferralData(contributor_id: string): Promise<ReferralData>;
}
