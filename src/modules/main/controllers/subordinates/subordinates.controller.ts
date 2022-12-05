import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { BasicContributorDto } from 'src/modules/shared/dto/basic-contributor/basic-contributor-dto';
import { ContributorDto } from 'src/modules/shared/dto/contributor/contributor-dto';
import { AuthenticatedGuard } from 'src/modules/shared/guards/authenticated/authenticated.guard';
import { SubordinatesFetchGuard } from 'src/modules/shared/guards/subordinates-fetch/subordinates-fetch.guard';
import { SupersubGuard } from 'src/modules/shared/guards/super-sub/supersub.guard';
import { IFetchSubordinatesQueries, OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { EntitiesMediatorService } from 'src/modules/shared/services/entities-mediator/entities-mediator/entities-mediator.service';
import { GeneralService } from 'src/modules/shared/services/general/general/general.service';
import { SubordinatesService } from 'src/modules/shared/services/subordinates/subordinates/subordinates.service';

@Controller('subordinates')
@UseGuards(AuthenticatedGuard)
export class SubordinatesController {
    constructor(
        private entitiesMediatorService: EntitiesMediatorService,
        private subordinatesService: SubordinatesService,
        private generalService: GeneralService
        ) {}
 
    @Get(':overseer_id')
    @UseGuards(SubordinatesFetchGuard)
    async fetchSubordinates(@Param('overseer_id') overseer_id: string, @Query() queries: IFetchSubordinatesQueries): Promise<Array<ContributorDto> | BasicContributorDto[] | ContributorDto | number> {
        
        // will throw error if no entity with the overseer_id
        await this.entitiesMediatorService.fetchEntity(overseer_id);

        if(queries.subordinate_id) {
            return this.generalService.fakePassword(await this.subordinatesService.fetchSubordinateUnder(overseer_id, queries))
        }

        if(queries.count) {
            return await this.countSubordinatesUnder(overseer_id, queries);
        } else if(queries.assignable) {
            if(!queries.intended_new_overseer_id) {
                throw new HttpException("New Overseer ID must be provided", HttpStatus.EXPECTATION_FAILED);
            }
            return (await this.getAssignableSubordinatesUnder(overseer_id, queries)).map(c => this.generalService.fakePassword(c));
        } else {
            return (await this.getSubordinatesUnder(overseer_id, queries)).map(c => this.generalService.fakePassword(c));
        }

    }

    @Post('assign_subordinates')
    async assignSubordinates(
        @Query('new_overseer_id') new_overseer_id: string,
        @Body() subordinates_id_list: string[]
    ): Promise<OperationFeedback> {
        return await this.subordinatesService.assignSubordinates(new_overseer_id, subordinates_id_list);
    }

    private async countSubordinatesUnder(overseer_id: string, options: IFetchSubordinatesQueries): Promise<number> {
        return await this.subordinatesService.countSubordinatesUnder(overseer_id, options);
    }

    private async getSubordinatesUnder(overseer_id: string, options: IFetchSubordinatesQueries): Promise<ContributorDto[]> {
        return await this.subordinatesService.fetchSubordinatesUnder(overseer_id, options);
    }

    private async getAssignableSubordinatesUnder(overseer_id: string, options: IFetchSubordinatesQueries): Promise<BasicContributorDto[]> {
        return await this.subordinatesService.fetchAssignableSubordinatesUnder(overseer_id, options);
    }


}
