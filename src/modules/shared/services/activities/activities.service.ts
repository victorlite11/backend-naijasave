import { Injectable } from '@nestjs/common';
import { ActionModel, ActivitiesModel } from 'src/modules/shared/dto/contributor/contributor-dto';
import { IRegisterAction, IRegisterActionRequest } from 'src/modules/shared/interface/shared-interfaces';
import { DbMediatorService } from '../db-mediator/db-mediator.service';

@Injectable()
export class ActivitiesService {
    constructor(
        private dbMediatorService: DbMediatorService
    ) {}

    async fetchPersonalActivitiesLog(
        contributor_id: string
    ): Promise<ActivitiesModel> {
        let c = await this.dbMediatorService.fetchContributor({_id: contributor_id});
        return c.activities;
    }


}
