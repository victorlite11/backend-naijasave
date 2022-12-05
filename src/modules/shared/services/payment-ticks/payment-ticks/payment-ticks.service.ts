import { Injectable } from '@nestjs/common';
import { DailyTicksModel, MonthlyTicksModel, YearlyTicksModel } from 'src/modules/shared/dto/contributor/contributor-dto';
import { IdGenerator } from 'src/modules/shared/helpers/id-generator/id-generator';
import { ITickOptions, OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { ContributorsService } from '../../contributors/contributors.service';
import { DbMediatorService } from '../../db-mediator/db-mediator.service';

@Injectable()
export class PaymentTicksService {

    constructor(
        private contributorService: ContributorsService,
        private dbMediatorService: DbMediatorService
    ) {}

    async tick(contributor_id: string, transaction_id: string, options: ITickOptions): Promise<OperationFeedback> {
        let date = new Date();
            
        // get contributor
        let contributor = await this.contributorService.fetchContributor(contributor_id);
        
        // get payment tick object
        let ptick = contributor.paymentTicks!!;
        if(!ptick.id) {
           ptick.id = IdGenerator.getRand(9999)
        }
        
        // in case, the value to undefined
        if(!ptick.yearlyTicks) {
            ptick.yearlyTicks = [];
        }
        let thisYrTicks = ptick.yearlyTicks.filter( t => t.id == options.year);
        
        // check if year tick exist or create new one
        let yrTick: YearlyTicksModel;
        if(thisYrTicks.length < 1) {
            // create new yearTick and add to the paymentTicks
            yrTick = this.yearTick(options.year);
            ptick.yearlyTicks.push(yrTick);
        } else {
            // it already exists
            yrTick = thisYrTicks[0];
        }
    
              
        // get this month ticks or create new one if it doesnt exist
        let thisMonthTicks = yrTick.monthlyTicks.filter( t => t.id == options.month);
    
    
        let mTick: MonthlyTicksModel;
        if(thisMonthTicks.length < 1) {
            // create new monthTick and add to yrTick
            mTick = this.monthTick(options.month);
            yrTick.monthlyTicks.push(mTick);
        } else {
            // it exists
            mTick = thisMonthTicks[0];
        }
    
        // add todayTick to monthTick
        let dayTick = this.dayTick({transactionId: transaction_id, day: options.day, month: options.month, year: options.year});
        mTick.dailyTicks.push(dayTick);
    
        // save back to db
        return await this.dbMediatorService.updateContributorPaymentTicks(
            {_id: contributor_id},
            {$set: {"paymentTicks": ptick}}
        );
    }
    
    private monthTick(month : number): MonthlyTicksModel {
        let m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] 
        let d = new Date().getMonth();
        let tick = new MonthlyTicksModel(month, m[month], []);
        
        return tick;
    }
    
    private yearTick(year : number): YearlyTicksModel {
        let d = new Date().getFullYear();
        let tick = new YearlyTicksModel(year, []);
        return tick;
    }
    
    private dayTick(options: {transactionId: string, day : number, month: number, year: number}): DailyTicksModel {
        let d = new Date();
        d.setDate(options.day);
        d.setMonth(options.month);
        d.setFullYear(options.year);

        let days = ['Sun','Mon','Tue','Wed','Thur','Fri','Sat'];
        let day_num = d.getDay();
        let tick: DailyTicksModel = {
          id: options.day,
          name: days[day_num],
          transaction_id: options.transactionId
        }
        return tick;
    }
}
