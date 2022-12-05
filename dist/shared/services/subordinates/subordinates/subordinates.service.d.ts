import { BasicContributorDto } from 'src/shared/dto/basic-contributor/basic-contributor-dto';
import { ContributorDto } from 'src/shared/dto/contributor/contributor-dto';
import { IFetchSubordinatesQueries, OperationFeedback } from 'src/shared/interface/shared-interfaces';
import { ContributorsService } from '../../contributors/contributors.service';
import { DbMediatorService } from '../../db-mediator/db-mediator.service';
export declare class SubordinatesService {
    private contributorsService;
    private dbMediatorService;
    constructor(contributorsService: ContributorsService, dbMediatorService: DbMediatorService);
    countSubordinatesUnder(overseer_id: string, options: IFetchSubordinatesQueries): Promise<number>;
    fetchSubordinatesUnder(overseer_id: string, options: IFetchSubordinatesQueries): Promise<ContributorDto[]>;
    fetchAssignableSubordinatesUnder(overseer_id: string, options: IFetchSubordinatesQueries): Promise<BasicContributorDto[]>;
    assignSubordinates(new_overseer_id: string, subordinates_id_list: string[]): Promise<OperationFeedback>;
    fetchSubordinateUnder(overseer_id: string, options: IFetchSubordinatesQueries): Promise<ContributorDto>;
}
