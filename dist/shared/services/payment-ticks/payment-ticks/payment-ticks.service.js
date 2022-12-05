"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentTicksService = void 0;
const common_1 = require("@nestjs/common");
const contributor_dto_1 = require("../../../dto/contributor/contributor-dto");
const id_generator_1 = require("../../../helpers/id-generator/id-generator");
const shared_interfaces_1 = require("../../../interface/shared-interfaces");
const contributors_service_1 = require("../../contributors/contributors.service");
const db_mediator_service_1 = require("../../db-mediator/db-mediator.service");
let PaymentTicksService = class PaymentTicksService {
    constructor(contributorService, dbMediatorService) {
        this.contributorService = contributorService;
        this.dbMediatorService = dbMediatorService;
    }
    async tick(contributor_id, transaction_id, options) {
        let date = new Date();
        let contributor = await this.contributorService.fetchContributor(contributor_id);
        let ptick = contributor.paymentTicks;
        if (!ptick.id) {
            ptick.id = id_generator_1.IdGenerator.getRand(9999);
        }
        if (!ptick.yearlyTicks) {
            ptick.yearlyTicks = [];
        }
        let thisYrTicks = ptick.yearlyTicks.filter(t => t.id == options.year);
        let yrTick;
        if (thisYrTicks.length < 1) {
            yrTick = this.yearTick(options.year);
            ptick.yearlyTicks.push(yrTick);
        }
        else {
            yrTick = thisYrTicks[0];
        }
        let thisMonthTicks = yrTick.monthlyTicks.filter(t => t.id == options.month);
        let mTick;
        if (thisMonthTicks.length < 1) {
            mTick = this.monthTick(options.month);
            yrTick.monthlyTicks.push(mTick);
        }
        else {
            mTick = thisMonthTicks[0];
        }
        let dayTick = this.dayTick({ transactionId: transaction_id, day: options.day, month: options.month, year: options.year });
        mTick.dailyTicks.push(dayTick);
        return await this.dbMediatorService.updateContributorPaymentTicks({ _id: contributor_id }, { $set: { "paymentTicks": ptick } });
    }
    monthTick(month) {
        let m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let d = new Date().getMonth();
        let tick = new contributor_dto_1.MonthlyTicksModel(month, m[month], []);
        return tick;
    }
    yearTick(year) {
        let d = new Date().getFullYear();
        let tick = new contributor_dto_1.YearlyTicksModel(year, []);
        return tick;
    }
    dayTick(options) {
        let d = new Date();
        d.setDate(options.day);
        d.setMonth(options.month);
        d.setFullYear(options.year);
        let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
        let day_num = d.getDay();
        let tick = {
            id: options.day,
            name: days[day_num],
            transaction_id: options.transactionId
        };
        return tick;
    }
};
PaymentTicksService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [contributors_service_1.ContributorsService,
        db_mediator_service_1.DbMediatorService])
], PaymentTicksService);
exports.PaymentTicksService = PaymentTicksService;
//# sourceMappingURL=payment-ticks.service.js.map