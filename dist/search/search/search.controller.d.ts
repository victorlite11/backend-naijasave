import { ContributorDto } from 'src/modules/shared/dto/contributor/contributor-dto';
import { SearchService } from 'src/modules/shared/services/search/search/search.service';
export declare class SearchController {
    private searchService;
    constructor(searchService: SearchService);
    searchContributors(overseer_id: string, use: "name" | "phone" | "email" | "location", search_keywords: string): Promise<ContributorDto[]>;
    searchContributorsUnified(overseer_id: string, search_keywords: string): Promise<ContributorDto[]>;
    searchSubordinates(overseer_id: string, use: "name" | "phone" | "email" | "location", search_keywords: string): Promise<ContributorDto[]>;
    searchTransactions(): void;
    searchAdmins(): void;
}
