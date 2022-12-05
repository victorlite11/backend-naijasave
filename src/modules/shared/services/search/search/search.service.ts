import { Injectable } from '@nestjs/common';
import { ContributorDto } from 'src/modules/shared/dto/contributor/contributor-dto';
import { EntityIdentity } from 'src/modules/shared/interface/shared-interfaces';
import { ContributorsService } from '../../contributors/contributors.service';
import { DbMediatorService } from '../../db-mediator/db-mediator.service';
import { EntitiesMediatorService } from '../../entities-mediator/entities-mediator/entities-mediator.service';
import { SubordinatesService } from '../../subordinates/subordinates/subordinates.service';

@Injectable()
export class SearchService {
    constructor(
        private subordinatesService: SubordinatesService,
        private contributorsService: ContributorsService,
        private dbMediatorService: DbMediatorService,
        private entitiesMediatorService: EntitiesMediatorService
    ) {}

    async searchContributorsUnified(overseer_id: string, search_keywords: string): Promise<ContributorDto[]> {
        let entity = await this.entitiesMediatorService.fetchEntity(overseer_id);
        let contributors: ContributorDto[];

        if(entity.identity == EntityIdentity.ADMIN) {
            contributors = await this.contributorsService.fetchContributors({});
        } else {
            contributors = await this.dbMediatorService.fetchContributors(
                {"basicInformation.overseerId": overseer_id}
            )
        }

        let result: ContributorDto[] = [];

        result = contributors.filter(
            c => c.basicInformation.name.includes(search_keywords) || 
                c.credentials.phoneNumber.includes(search_keywords) ||
                c.location.address.includes(search_keywords) ||
                c._id.includes(search_keywords)
            );

        return result;
    
    }
    async searchContributors(
        option: {
            overseer_id: string, 
            use: "name" | "phone" | "email" | "location", 
            search_keywords: string
        }): Promise<ContributorDto[]> {
            let contributors = await this.contributorsService.fetchContributors({});
    
            let result: ContributorDto[] = [];
            
            contributors.forEach(subordinate => {
                switch(option.use) {
                    case "name":
                        if(subordinate.basicInformation?.name.toLowerCase().includes(option.search_keywords.toLowerCase())) {
                            result.push(subordinate);
                        }
                        break;
                    case "phone":
                        if(subordinate.credentials.phoneNumber.includes(option.search_keywords)) {
                            result.push(subordinate);
                        }
                        break;
                    case "email":
                        if(subordinate.credentials.email.includes(option.search_keywords)) {
                            result.push(subordinate);
                        }
                        break;
                    case "location":
                        if(subordinate.location.address.includes(option.search_keywords)) {
                            result.push(subordinate);
                        }
                        break;
                    default:
                        break;
                }
                
            })
    
            return result;
    }

    async searchSubordinates(
        option: {
            overseer_id: string, 
            use: "name" | "phone" | "email" | "location", 
            search_keywords: string
        }): Promise<ContributorDto[]> {
        let subordinates = await this.subordinatesService.fetchSubordinatesUnder(
            option.overseer_id,
            {identity: undefined}
        );

        let result: ContributorDto[] = [];
        
        subordinates.forEach(subordinate => {
            switch(option.use) {
                case "name":
                    if(subordinate.basicInformation?.name.toLowerCase().includes(option.search_keywords.toLowerCase())) {
                        result.push(subordinate);
                    }
                    break;
                case "phone":
                    if(subordinate.credentials.phoneNumber.includes(option.search_keywords)) {
                        result.push(subordinate);
                    }
                    break;
                case "email":
                    if(subordinate.credentials.email.includes(option.search_keywords)) {
                        result.push(subordinate);
                    }
                    break;
                case "location":
                    if(subordinate.location.address.includes(option.search_keywords)) {
                        result.push(subordinate);
                    }
                    break;
                default:
                    break;
            }
            
        })

        return result;
    }
}
