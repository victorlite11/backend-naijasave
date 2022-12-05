"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedModule = void 0;
const common_1 = require("@nestjs/common");
const transactions_service_1 = require("./services/transactions/transactions.service");
const requests_service_1 = require("./services/requests/requests.service");
const identity_service_1 = require("./services/identity/identity.service");
const privilege_service_1 = require("./services/privilege/privilege.service");
const activities_service_1 = require("./services/activities/activities.service");
const accounting_service_1 = require("./services/accounting/accounting.service");
const payment_service_1 = require("./services/payment/payment.service");
const payment_mediator_service_1 = require("./services/payment-mediator/payment-mediator.service");
const admin_service_1 = require("./services/admin/admin.service");
const db_mediator_service_1 = require("./services/db-mediator/db-mediator.service");
const company_service_1 = require("./services/company/company.service");
const qualification_service_1 = require("./services/qualification/qualification.service");
const auth_service_1 = require("./services/auth/auth.service");
const subordinates_service_1 = require("./services/subordinates/subordinates/subordinates.service");
const announcements_service_1 = require("./services/announcements/announcements/announcements.service");
const search_service_1 = require("./services/search/search/search.service");
const referral_service_1 = require("./services/referral/referral/referral.service");
const payment_ticks_service_1 = require("./services/payment-ticks/payment-ticks/payment-ticks.service");
const contributors_service_1 = require("./services/contributors/contributors.service");
const entities_mediator_service_1 = require("./services/entities-mediator/entities-mediator/entities-mediator.service");
const sms_mediator_service_1 = require("./services/sms-mediator/sms-mediator/sms-mediator.service");
const general_service_1 = require("./services/general/general/general.service");
const chat_mediator_service_1 = require("./services/chat-mediator/chat-mediator/chat-mediator.service");
const sms_service_1 = require("./services/sms/sms/sms.service");
const password_reset_service_1 = require("./services/password-reset/password-reset.service");
const commission_service_1 = require("./services/commission/commission/commission.service");
const local_auth_guard_1 = require("./guards/local-auth/local-auth.guard");
const authenticated_guard_1 = require("./guards/authenticated/authenticated.guard");
let SharedModule = class SharedModule {
};
SharedModule = __decorate([
    common_1.Module({
        providers: [
            transactions_service_1.TransactionsService,
            requests_service_1.RequestsService,
            identity_service_1.IdentityService,
            privilege_service_1.PrivilegeService,
            activities_service_1.ActivitiesService,
            accounting_service_1.AccountingService,
            payment_service_1.PaymentService,
            authenticated_guard_1.AuthenticatedGuard,
            payment_mediator_service_1.PaymentMediatorService,
            admin_service_1.AdminService,
            db_mediator_service_1.DbMediatorService,
            company_service_1.CompanyService,
            qualification_service_1.QualificationService,
            auth_service_1.AuthService,
            local_auth_guard_1.LocalAuthGuard,
            subordinates_service_1.SubordinatesService,
            announcements_service_1.AnnouncementsService,
            search_service_1.SearchService, referral_service_1.ReferralService,
            payment_ticks_service_1.PaymentTicksService,
            commission_service_1.CommissionService,
            contributors_service_1.ContributorsService,
            entities_mediator_service_1.EntitiesMediatorService,
            sms_mediator_service_1.SmsMediatorService,
            { provide: "VONAGE_API_KEY", useValue: "02562792" },
            { provide: "VONAGE_API_SECRET", useValue: "JokMjd6EuAZSpfPx" },
            general_service_1.GeneralService,
            chat_mediator_service_1.ChatMediatorService,
            sms_service_1.SmsService,
            password_reset_service_1.PasswordResetService
        ],
        exports: [
            requests_service_1.RequestsService,
            contributors_service_1.ContributorsService,
            payment_mediator_service_1.PaymentMediatorService,
            transactions_service_1.TransactionsService,
            db_mediator_service_1.DbMediatorService,
            auth_service_1.AuthService,
            commission_service_1.CommissionService,
            accounting_service_1.AccountingService,
            entities_mediator_service_1.EntitiesMediatorService,
            subordinates_service_1.SubordinatesService,
            announcements_service_1.AnnouncementsService,
            search_service_1.SearchService,
            referral_service_1.ReferralService,
            authenticated_guard_1.AuthenticatedGuard,
            activities_service_1.ActivitiesService,
            privilege_service_1.PrivilegeService,
            qualification_service_1.QualificationService,
            identity_service_1.IdentityService,
            admin_service_1.AdminService,
            general_service_1.GeneralService,
            local_auth_guard_1.LocalAuthGuard,
            company_service_1.CompanyService,
            chat_mediator_service_1.ChatMediatorService,
            sms_mediator_service_1.SmsMediatorService,
            sms_service_1.SmsService,
            password_reset_service_1.PasswordResetService
        ]
    })
], SharedModule);
exports.SharedModule = SharedModule;
//# sourceMappingURL=shared.module.js.map