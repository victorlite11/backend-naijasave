import { Body, Controller, Get, Request, Param, Post, UseGuards, NotFoundException } from '@nestjs/common';
import { AdminDto } from 'src/modules/shared/dto/admin/admin-dto';
import { NewAdminDto } from 'src/modules/shared/dto/new-admin/new-admin-dto';
import { AdminGuard } from 'src/modules/shared/guards/admin/admin.guard';
import { AuthenticatedGuard } from 'src/modules/shared/guards/authenticated/authenticated.guard';
import { HeadAdminGuard } from 'src/modules/shared/guards/head-admin/head-admin.guard';
import { IdGenerator } from 'src/modules/shared/helpers/id-generator/id-generator';
import { OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { AdminService } from 'src/modules/shared/services/admin/admin.service';
import { GeneralService } from 'src/modules/shared/services/general/general/general.service';

@Controller('admins')
@UseGuards(AuthenticatedGuard, AdminGuard)
export class AdminController {
    constructor(
        private adminService: AdminService,
        private generalService: GeneralService
    ) {}

    @Post('new-admin')
    @UseGuards(HeadAdminGuard)
    async createNewAdmin(
        @Body() payload: NewAdminDto
    ): Promise<OperationFeedback> {
        return await this.adminService.createAdmin(payload);
    }

    @Get('self')
    async fetchSelfData(@Request() req: any): Promise<AdminDto> {

        let contributor = await this.adminService.fetchAdmin(req.user.userId);
        return this.generalService.fakePassword(contributor);
    }


    @Get()
    async fetchAdmins(): Promise<AdminDto[]> {
        return (await this.adminService.fetchAdmins({})).map(admin => this.generalService.fakePassword(admin));
    }

    @Get(":id")
    async fetchAdmin(@Param('id') id: string, @Request() req: any): Promise<AdminDto> {
        id = (id == undefined || id == "undefined") ? req.user.userId : id;
        let admin = await this.adminService.fetchAdmin(id);
        return this.generalService.fakePassword(admin)
    }
}
