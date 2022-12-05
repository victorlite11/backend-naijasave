import { BasicContributorDto } from 'src/modules/shared/dto/basic-contributor/basic-contributor-dto';
import { ContributorDto } from 'src/modules/shared/dto/contributor/contributor-dto';
import { IFetchSubordinatesQueries, OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { EntitiesMediatorService } from 'src/modules/shared/services/entities-mediator/entities-mediator/entities-mediator.service';
import { GeneralService } from 'src/modules/shared/services/general/general/general.service';
import { SubordinatesService } from 'src/modules/shared/services/subordinates/subordinates/subordinates.service';
export declare class SubordinatesController {
    private entitiesMediatorService;
    private subordinatesService;
    private generalService;
    constructor(entitiesMediatorService: EntitiesMediatorService, subordinatesService: SubordinatesService, generalService: GeneralService);
    fetchSubordinates(overseer_id: string, queries: IFetchSubordinatesQueries): Promise<Array<ContributorDto> | BasicContributorDto[] | ContributorDto | number>;
    assignSubordinates(new_overseer_id: string, subordinates_id_list: string[]): Promise<OperationFeedback>;
    private countSubordinatesUnder;
    private getSubordinatesUnder;
    private getAssignableSubordinatesUnder;
}
