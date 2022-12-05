import { Injectable, NotFoundException } from '@nestjs/common';
import { BasicContributorDto } from 'src/modules/shared/dto/basic-contributor/basic-contributor-dto';
import { ContributorDto } from 'src/modules/shared/dto/contributor/contributor-dto';
import { IFetchSubordinatesQueries, OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { ContributorsService } from '../../contributors/contributors.service';
import { DbMediatorService } from '../../db-mediator/db-mediator.service';

@Injectable()
export class SubordinatesService {
    constructor(
        private contributorsService: ContributorsService,
        private dbMediatorService: DbMediatorService
    ) {}

    async countSubordinatesUnder(overseer_id: string, options: IFetchSubordinatesQueries): Promise<number> {
        let contributors = await this.contributorsService.fetchContributors({
            overseer_id: overseer_id,
            identity: options.identity
        });
        
        return contributors.length;
    }

    async fetchSubordinatesUnder(overseer_id: string, options: IFetchSubordinatesQueries): Promise<ContributorDto[]> {
        return await this.contributorsService.fetchContributors({
            overseer_id: overseer_id,
            identity: options.identity
        }); 
    }

    async fetchAssignableSubordinatesUnder(overseer_id: string, options: IFetchSubordinatesQueries): Promise<BasicContributorDto[]> {
        let result: BasicContributorDto[] = [];

        let subordinates = await this.contributorsService.fetchContributors({
            overseer_id: overseer_id,
            identity: options.identity
        }); 

        let intendedNewOverseer = await this.contributorsService.fetchContributor(options.intended_new_overseer_id);

        if(!intendedNewOverseer) {
            throw new NotFoundException(`Subordinate with id ${options.intended_new_overseer_id} does not exist`);
        }

        if(intendedNewOverseer.identity.isSuperContributor) {
            subordinates.forEach(s => {
                if(!s.identity.isSuperContributor) {
                    result.push({
                        name: s.basicInformation.name,
                        phoneNumber: s.credentials.phoneNumber,
                        imageUrl: "",
                        _id: s._id,
                        status: s.activities.status
                    })
                }
            });
        }

        if(intendedNewOverseer.identity.isSubContributor) {
            subordinates.forEach(s => {
                if(!s.identity.isSuperContributor && !s.identity.isSubContributor) {
                    result.push({
                        name: s.basicInformation.name,
                        phoneNumber: s.credentials.phoneNumber,
                        imageUrl: "",
                        _id: s._id,
                        status: s.activities.status
                    })
                }
            });
        }

        return result;
    }

    async assignSubordinates(
        new_overseer_id: string,
        subordinates_id_list: string[]
    ): Promise<OperationFeedback> {
        let c = await this.contributorsService.fetchContributor(new_overseer_id);
        if(!c) {
            throw new NotFoundException(`Subordinate with id ${new_overseer_id} does not exist`);
        }
        return await this.dbMediatorService.assignSubordinates(new_overseer_id, subordinates_id_list);
    }

    async fetchSubordinateUnder(overseer_id: string, options: IFetchSubordinatesQueries): Promise<ContributorDto> {
        return await this.contributorsService.fetchContributor(options.subordinate_id) 
    }
}
