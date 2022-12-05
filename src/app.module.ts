import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './modules/core/core.module';
import { MainModule } from './modules/main/main.module';
import { AuthenticationModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    AuthenticationModule,
    CoreModule, 
    MainModule, 
    UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
