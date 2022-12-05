import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ContributorDto } from 'src/modules/shared/dto/contributor/contributor-dto';
import { AuthenticatedGuard } from 'src/modules/shared/guards/authenticated/authenticated.guard';
import { SearchService } from 'src/modules/shared/services/search/search/search.service';
import { SubordinatesService } from 'src/modules/shared/services/subordinates/subordinates/subordinates.service';

@Controller('search')
@UseGuards(AuthenticatedGuard)
export class SearchController {
    constructor(
        private searchService: SearchService
    ) {}
    @Get('contributors')
    async searchContributors(
        @Query('overseer_id') overseer_id: string,
        @Query('use') use: "name" | "phone" | "email" | "location",
        @Query('search-keywords') search_keywords: string,
    ): Promise<ContributorDto[]> {

        // check required fields
        if(!overseer_id) {
            throw new HttpException("No overseer_id provided", HttpStatus.EXPECTATION_FAILED);
        }
        
        return await this.searchService.searchContributors(
            {
                overseer_id: overseer_id,
                use: use,
                search_keywords: search_keywords
            }
        )
        
    }

    @Get('contributors_unified_search')
    async searchContributorsUnified(
        @Query('overseer_id') overseer_id: string,
        @Query('search_keywords') search_keywords: string
       
    ): Promise<ContributorDto[]> {
        return await this.searchService.searchContributorsUnified(overseer_id, search_keywords)
    }

    @Get('subordinates')
    async searchSubordinates(
        @Query('overseer_id') overseer_id: string,
        @Query('use') use: "name" | "phone" | "email" | "location",
        @Query('search-keywords') search_keywords: string,
    ): Promise<ContributorDto[]> {


        // check required fields
        if(!overseer_id) {
            throw new HttpException("No overseer_id provided", HttpStatus.EXPECTATION_FAILED);
        }
        
        return await this.searchService.searchSubordinates(
            {
                overseer_id: overseer_id,
                use: use,
                search_keywords: search_keywords
            }
        )

    }

    @Get('transactions')
    searchTransactions() {

    }

    @Get('admins')
    searchAdmins() {
        9
    }
}
