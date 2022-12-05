import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SharedModule } from 'src/modules/shared/shared.module';
import { UsersModule } from '../users/users.module';
import { jwtConstant } from './constants';
import { AuthController } from './controllers/auth/auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { AuthService } from './services/auth/auth.service';

@Module({
  providers: [AuthService, LocalStrategy, JwtStrategy],
  imports: [
    UsersModule, SharedModule, PassportModule,
    JwtModule.register({
      secret: jwtConstant.secret,
      signOptions: {expiresIn: '30d'}
    })
  ],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthenticationModule {}
