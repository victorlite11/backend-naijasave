import { ContributorDto } from 'src/shared/dto/contributor/contributor-dto';
import { ContributorsService } from '../../contributors/contributors.service';
import { DbMediatorService } from '../../db-mediator/db-mediator.service';
import { EntitiesMediatorService } from '../../entities-mediator/entities-mediator/entities-mediator.service';
import { SubordinatesService } from '../../subordinates/subordinates/subordinates.service';
export declare class SearchService {
    private subordinatesService;
    private contributorsService;
    private dbMediatorService;
    private entitiesMediatorService;
    constructor(subordinatesService: SubordinatesService, contributorsService: ContributorsService, dbMediatorService: DbMediatorService, entitiesMediatorService: EntitiesMediatorService);
    searchContributorsUnified(overseer_id: string, search_keywords: string): Promise<ContributorDto[]>;
    searchContributors(option: {
        overseer_id: string;
        use: "name" | "phone" | "email" | "location";
        search_keywords: string;
    }): Promise<ContributorDto[]>;
    searchSubordinates(option: {
        overseer_id: string;
        use: "name" | "phone" | "email" | "location";
        search_keywords: string;
    }): Promise<ContributorDto[]>;
}
