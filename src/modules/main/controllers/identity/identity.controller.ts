import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AdminIdentityModel } from 'src/modules/shared/dto/admin/admin-dto';
import { IdentityModel } from 'src/modules/shared/dto/contributor/contributor-dto';
import { AuthenticatedGuard } from 'src/modules/shared/guards/authenticated/authenticated.guard';
import { IdentityService } from 'src/modules/shared/services/identity/identity.service';

@Controller('identity')
@UseGuards(AuthenticatedGuard)
export class IdentityController {
    constructor(
        private identityService: IdentityService
    ) {}

    @Get('contributor_identity')
    async fetchContributorPrivilege(
        @Query('contributor_id') contributor_id: string
    ): Promise<IdentityModel> {
        return await this.identityService.fetchContributorIdentity(contributor_id);
    }

    @Get('admin_identity')
    async fetchAdminPrivilege(
        @Query('admin_id') admin_id: string
    ): Promise<AdminIdentityModel> {
        return await this.identityService.fetchAdminIdentity(admin_id);
    }

    @Post('change_contributor_identity')
    async changeContributorPrivilege(
        @Query('contributor_id') contributor_id: string,
        @Body() interested_identity: {interested_identity: "super" | "sub" | "investor" | "contributor"}
    ): Promise<{success: boolean, message: string}> {
        return this.identityService.changeContributorIdentity(
            contributor_id, interested_identity
        )
    }

    @Post('change_admin_identity')
    async changeAdminPrivilege(
        @Query('admin_id') admin_id: string,
        @Body() interested_identity: {interested_identity: "super" | "sub" | "head"}
    ): Promise<{success: boolean, message: string}> {
        return this.identityService.changeAdminIdentity(
            admin_id, interested_identity
        )
    }
}
