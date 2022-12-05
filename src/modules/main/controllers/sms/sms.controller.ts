import { Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/modules/shared/guards/authenticated/authenticated.guard';
import { OperationFeedback, SMSProforma } from 'src/modules/shared/interface/shared-interfaces';
import { SmsMediatorService } from 'src/modules/shared/services/sms-mediator/sms-mediator/sms-mediator.service';
import { SmsService } from 'src/modules/shared/services/sms/sms/sms.service';

@Controller('sms')
@UseGuards(AuthenticatedGuard)
export class SmsController {
    constructor(
        private smsService: SmsService,
        private smsMediator: SmsMediatorService
    ) {}

    @Get('proformas')
    async fetchSmsProforma(
        @Query('for') for_: "account-change" | "daily-savings" | "debits" | "credits" | "signups" | "deposit-requests" | "withdrawal-requests" 
    ): Promise<SMSProforma> {
        return await this.smsService.fetchSmsProforma(for_);
    }

    @Get('all-proformas')
    async fetchSmsProformas( 
    ): Promise<SMSProforma[]> {
       return await this.smsService.fetchSmsProformas();
    }

    @Post('proformas')
    async insertProforma(@Body() proforma: SMSProforma): Promise<OperationFeedback> {
        return await this.smsService.insertSmsProforma(proforma);
    }

    @Put('proformas')
    async updateProforma(@Body() proforma: SMSProforma): Promise<OperationFeedback> {
        return await this.smsService.updateSmsProforma(proforma);
    }

    @Post("send-sms")
    async sendSms(@Body() payload: {message: string, recipients: string[]}): Promise<OperationFeedback> {
        return await this.smsMediator.messageRecipients(payload)
    }
}
