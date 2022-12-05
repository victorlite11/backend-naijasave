import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActionModel, ActivitiesModel } from 'src/modules/shared/dto/contributor/contributor-dto';
import { AuthenticatedGuard } from 'src/modules/shared/guards/authenticated/authenticated.guard';
import { ActivitiesService } from 'src/modules/shared/services/activities/activities.service';

@Controller('activities')
@UseGuards(AuthenticatedGuard)
export class ActivitiesController {
    constructor(
        private actvitiesService: ActivitiesService
    ) {}

    @Get('personal_activities_data')
    async fetchPersonalActivitiesLog(
        @Query('contributor_id') contributor_id: string
    ): Promise<ActivitiesModel> {
        return await this.actvitiesService.fetchPersonalActivitiesLog(contributor_id);
    }
}
