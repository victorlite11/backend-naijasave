import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/services/users/users.service';
import { AdminDto } from 'src/modules/shared/dto/admin/admin-dto';
import { ContributorDto } from 'src/modules/shared/dto/contributor/contributor-dto';
import { GeneralService } from 'src/modules/shared/services/general/general/general.service';

import * as bcrypt from "bcrypt";
import { passwordHashConstant } from '../../constants';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private generalService: GeneralService,
        private jwtService: JwtService
    ) {}
 
    async validateUser(payload: {phoneNumber: string, password: string}): Promise<any> {

        let user = await this.usersService.findOne({"credentials.phoneNumber": payload.phoneNumber});

        if (await this.providedPasswordIsCorrect(user, payload.password)) {
            const { ...result } = user;
            
            return this.generalService.fakePassword(result);
        } else {
            if (user) {
                /***
                 * Rare scenerio but exists [for the headAdmin]
                 * This block is added in scenerios where the admin also signed up as a contributor
                 * while an admin with the same credentials
                 * --------- Though a problem still remains unfixed until a different strategy is
                 * --------- implemented for fetching contributors and admins
                 * --------- > Same password in admin collection and contributor collection <
                 */
                user = await this.usersService.findOne({"credentials.phoneNumber": payload.phoneNumber}, true);
                if (this.providedPasswordIsCorrect(user, payload.password)) {
                    const { ...result } = user;
            
                    return this.generalService.fakePassword(result);
                }
            }
        }

        return null;
    }

    async login(user: AdminDto | ContributorDto): Promise<{access_token: string, userId: string}> {

        const payload = {username: user.credentials.phoneNumber, sub: user._id}

        return {
            access_token: await this.jwtService.signAsync(payload),
            userId: user._id
        }
    }

    private async providedPasswordIsCorrect <T extends AdminDto | ContributorDto> (user: T, password: string) : Promise<boolean> {
            if(user && await bcrypt.compare(password, user.credentials.password)) {
                return true;
            } else {
                return false;
            }
    }

    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, passwordHashConstant.saltOrRounds)
    }
}
