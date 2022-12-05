import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReferralModel } from 'src/modules/shared/dto/contributor/contributor-dto';
import { BasicContributorDto } from 'src/modules/shared/dto/basic-contributor/basic-contributor-dto';
import { ReferralService } from 'src/modules/shared/services/referral/referral/referral.service';
import { ReferralData } from 'src/modules/shared/interface/shared-interfaces';
import { AuthenticatedGuard } from 'src/modules/shared/guards/authenticated/authenticated.guard';

@Controller('referral')
@UseGuards(AuthenticatedGuard)
export class ReferralController {
    constructor(private referralService: ReferralService) {}

    @Get('referral-data')
    async getReferralData(
        @Query('contributor_id') contributor_id: string
    ): Promise<ReferralData> {
        return await this.referralService.constructAndReturnReferralData({contributor_id : contributor_id})
    }
}
