import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AnnouncementsDto, Category } from 'src/modules/shared/dto/announcements/announcements-dto';
import { AdminGuard } from 'src/modules/shared/guards/admin/admin.guard';
import { AuthenticatedGuard } from 'src/modules/shared/guards/authenticated/authenticated.guard';
import { AnnouncementsCountResponse, OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { AnnouncementsService } from 'src/modules/shared/services/announcements/announcements/announcements.service';

@Controller('announcements')
@UseGuards(AuthenticatedGuard)
export class AnnouncementsController {
    constructor(
        private announcementsService: AnnouncementsService
    ) {}

    @Post('fetch-announcements')
    async fetchAnnouncements(@Query('count') count: boolean, @Body() category:  Category): Promise<AnnouncementsCountResponse | AnnouncementsDto[]> {
        
        let announcements = await this.announcementsService.fetchAnnouncements(category);

        if(count) {
            let announcementCount = new AnnouncementsCountResponse();
            announcementCount.total = announcements.length;
            return announcementCount;
        } else {
            return announcements;
        }
    }

    @Post('new-announcement')
    @UseGuards(AdminGuard)
    async createAnnouncement(@Body() announcement: AnnouncementsDto) {
        await this.announcementsService.createAnnouncement(announcement);
    }

    @Post('update-announcement')
    @UseGuards(AdminGuard)
    async updateAnnouncement(@Body() announcement: AnnouncementsDto): Promise<boolean> {
        await this.announcementsService.updateAnnouncement(announcement);
        return true;
    }

    @Get('fetch-announcement')
    async fetchAnnouncement(@Query('id') id: string): Promise<AnnouncementsDto> {
        return await this.announcementsService.fetchAnnouncement(id);
    }
    
    @Delete('delete-announcement')
    @UseGuards(AdminGuard)
    async deleteAnnouncement(@Query('id') id: string): Promise<OperationFeedback> {
        return await this.announcementsService.deleteAnnouncement(id);
    }
}
