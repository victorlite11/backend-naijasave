import { Module } from '@nestjs/common';
import { CoreModule } from 'src/modules/core/core.module';
import { SharedModule } from 'src/modules/shared/shared.module';
import { ContributorController } from './controllers/contributor/contributor.controller';
import { AdminController } from './controllers/admin/admin.controller'
import { IdentityController } from './controllers/identity/identity.controller';
import { GeneralController } from './controllers/general/general.controller';
import { CompanyController } from './controllers/company/company.controller';
import { ChatController } from './controllers/chat/chat.controller';
import { AnnouncementsController } from './controllers/announcements/announcements.controller';
import { ActivitiesController } from './controllers/activities/activities.controller';
import { PasswordResetController } from './controllers/password-reset/password-reset.controller';
import { PaymentController } from './controllers/payment/payment.controller';
import { PaymentTicksController } from './controllers/payment-ticks/payment-ticks.controller';
import { PrivilegeController } from './controllers/privilege/privilege.controller';
import { ReferralController } from './controllers/referral/referral.controller';
import { RequestsController } from './controllers/requests/requests.controller';
import { SearchController } from './controllers/search/search.controller';
import { SmsController } from './controllers/sms/sms.controller';
import { SubordinatesController } from './controllers/subordinates/subordinates.controller';
import { TransactionsController } from './controllers/transactions/transactions.controller';

@Module({
  controllers: [
    ContributorController, 
    AdminController, 
    IdentityController, 
    GeneralController,
    RequestsController,
    CompanyController,
    TransactionsController,
    SmsController,
    SearchController,
    SubordinatesController,
    ChatController,
    PrivilegeController,
    AnnouncementsController,
    ReferralController,
    ActivitiesController,
    PasswordResetController,
    PaymentController,
    PaymentTicksController
  ],
  imports : [CoreModule, SharedModule]
})
export class MainModule {}
