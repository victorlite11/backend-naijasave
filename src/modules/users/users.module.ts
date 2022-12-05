import { Module } from '@nestjs/common';
import { SharedModule } from 'src/modules/shared/shared.module';
import { UsersService } from './services/users/users.service';

@Module({
  providers: [UsersService],
  imports: [SharedModule],
  exports: [UsersService]
})
export class UsersModule {}
