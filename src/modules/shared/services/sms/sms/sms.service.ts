import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IdGenerator } from 'src/modules/shared/helpers/id-generator/id-generator';
import { OperationFeedback, SMSProforma } from 'src/modules/shared/interface/shared-interfaces';
import { DbMediatorService } from '../../db-mediator/db-mediator.service';

@Injectable()
export class SmsService {
    constructor(
        private dbMediatorService: DbMediatorService
    ) {}
    async insertSmsProforma(proforma: SMSProforma): Promise<OperationFeedback> {
        if(!proforma._id) {
            proforma._id = `sms-${IdGenerator.getRand(9999)}`;
        }

        // should not create sms that already exists
        let sms = await this.fetchSmsProforma(proforma.for);

        if(sms) {
            throw new HttpException(`${proforma.for} already exists. You should edit instead`, HttpStatus.BAD_REQUEST)
        }

        await this.dbMediatorService.insertSMSProforma(proforma);
        return {success: true, message: "SMS Created Successfully"};
    }

    async updateSmsProforma(proforma: SMSProforma): Promise<OperationFeedback> {

        // should not create sms that already exists
        let sms = await this.dbMediatorService.fetchSMSProforma({_id: proforma._id});

        if(sms.for !== proforma.for) {
            throw new HttpException(`You cannot change the sms category`, HttpStatus.BAD_REQUEST)
        }

        return await this.dbMediatorService.updateSMSProforma({
            _id: proforma._id
        },
        {
            $set: {message: proforma.message}
        }
        )
    }

    async fetchSmsProforma(for_: "daily-savings" | "account-change" | "debits" | "credits" | "signups" | "deposit-requests" | "withdrawal-requests"): Promise<SMSProforma> {
        return await this.dbMediatorService.fetchSMSProforma({for: for_});
    }

    async fetchSmsProformas(): Promise<SMSProforma[]> {
        return await this.dbMediatorService.fetchSMSProformas({})
    }
}
