import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AdminPrivilegeModel } from 'src/modules/shared/dto/admin/admin-dto';
import { PrivilegeModel } from 'src/modules/shared/dto/contributor/contributor-dto';
import { AuthenticatedGuard } from 'src/modules/shared/guards/authenticated/authenticated.guard';
import { HeadAdminGuard } from 'src/modules/shared/guards/head-admin/head-admin.guard';
import { OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { PrivilegeService } from 'src/modules/shared/services/privilege/privilege.service';

@Controller('privilege')
@UseGuards(AuthenticatedGuard)
export class PrivilegeController {
    constructor(
        private privilegeService: PrivilegeService
    ) {}

    @Get('contributor_privilege')
    async fetchContributorPrivilege(
        @Query('contributor_id') contributor_id: string
    ): Promise<PrivilegeModel> {
        return await this.privilegeService.fetchContributorPrivilege(contributor_id);
    }

    @Get('admin_privilege')
    @UseGuards(HeadAdminGuard)
    async fetchAdminPrivilege(
        @Query('admin_id') admin_id: string
    ): Promise<AdminPrivilegeModel> {
        return await this.privilegeService.fetchAdminPrivilege(admin_id);
    }

    @Post('change_contributor_privilege')
    async changeContributorPrivilege(
        @Query('contributor_id') contributor_id: string,
        @Body() modified_privilege: PrivilegeModel
    ): Promise<OperationFeedback> {
        return this.privilegeService.changeContributorPrivilege(
            contributor_id, modified_privilege
        )
    }

    @Post('change_admin_privilege')
    @UseGuards(HeadAdminGuard)
    async changeAdminPrivilege(
        @Query('admin_id') admin_id: string,
        @Body() modified_privilege: AdminPrivilegeModel
    ): Promise<OperationFeedback> {
        return this.privilegeService.changeAdminPrivilege(
            admin_id, modified_privilege
        )
    }
}
