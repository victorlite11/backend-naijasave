import { Module } from '@nestjs/common';
import { TransactionsService } from './services/transactions/transactions.service';
import { RequestsService } from './services/requests/requests.service';
import { IdentityService } from './services/identity/identity.service';
import { PrivilegeService } from './services/privilege/privilege.service';
import { ActivitiesService } from './services/activities/activities.service';
import { AccountingService } from './services/accounting/accounting.service';
import { PaymentService } from './services/payment/payment.service';
import { PaymentMediatorService } from './services/payment-mediator/payment-mediator.service';
import { AdminService } from './services/admin/admin.service';
import { DbMediatorService } from './services/db-mediator/db-mediator.service';
import { CompanyService } from './services/company/company.service';
import { QualificationService } from './services/qualification/qualification.service';
import { AuthService } from './services/auth/auth.service';
import { SubordinatesService } from './services/subordinates/subordinates/subordinates.service';
import { AnnouncementsService } from './services/announcements/announcements/announcements.service';
import { SearchService } from './services/search/search/search.service';
import { ReferralService } from './services/referral/referral/referral.service';
import { PaymentTicksService } from './services/payment-ticks/payment-ticks/payment-ticks.service';
import { ContributorsService } from './services/contributors/contributors.service';
import { EntitiesMediatorService } from './services/entities-mediator/entities-mediator/entities-mediator.service';
import { SmsMediatorService } from './services/sms-mediator/sms-mediator/sms-mediator.service';
import { GeneralService } from './services/general/general/general.service';
import { ChatMediatorService } from './services/chat-mediator/chat-mediator/chat-mediator.service';
import { SmsService } from './services/sms/sms/sms.service';
import { PasswordResetService } from './services/password-reset/password-reset.service';
import { CommissionService } from './services/commission/commission/commission.service';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { AuthenticatedGuard } from './guards/authenticated/authenticated.guard';

@Module({
  providers: [ 
    TransactionsService, 
    RequestsService, 
    IdentityService, 
    PrivilegeService, 
    ActivitiesService, 
    AccountingService, 
    PaymentService, 
    AuthenticatedGuard,
    PaymentMediatorService, 
    AdminService, 
    DbMediatorService, 
    CompanyService, 
    QualificationService, 
    AuthService, 
    LocalAuthGuard,
    SubordinatesService, 
    AnnouncementsService, 
    SearchService, ReferralService, 
    PaymentTicksService,
    CommissionService,
    ContributorsService,
    EntitiesMediatorService,
    SmsMediatorService,
    {provide: "VONAGE_API_KEY", useValue: "02562792"},
    {provide: "VONAGE_API_SECRET", useValue: "JokMjd6EuAZSpfPx"},
    GeneralService,
    ChatMediatorService,
    SmsService,
    PasswordResetService
   ],
  exports: [ 
    RequestsService, 
    ContributorsService, 
    PaymentMediatorService,
    TransactionsService,
    DbMediatorService,
    AuthService,
    CommissionService,
    AccountingService,
    EntitiesMediatorService,
    SubordinatesService,
    AnnouncementsService,
    SearchService,
    ReferralService,
    AuthenticatedGuard,
    ActivitiesService,
    PrivilegeService,
    QualificationService,
    IdentityService,
    AdminService,
    GeneralService,
    LocalAuthGuard,
    CompanyService,
    ChatMediatorService,
    SmsMediatorService,
    SmsService,
    PasswordResetService
  ]
})
export class SharedModule {}
