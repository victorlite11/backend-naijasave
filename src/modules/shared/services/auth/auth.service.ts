import { Injectable } from '@nestjs/common';
import { AdminDto } from 'src/modules/core/dtos/admin/admin';
import { ContributorDto } from 'src/modules/core/dtos/contributor/contributor';
import { AuthDto } from 'src/modules/shared/dto/auth/auth-dto';
import { IdGenerator } from 'src/modules/shared/helpers/id-generator/id-generator';
import { IAuthKey, IAuthResult } from 'src/modules/shared/interface/shared-interfaces';
import { DbMediatorService } from '../db-mediator/db-mediator.service';
import { SmsMediatorService } from '../sms-mediator/sms-mediator/sms-mediator.service';

@Injectable()
export class AuthService {
    constructor(
        private dbMediatorService: DbMediatorService,
        private smsMediatorService: SmsMediatorService
      ) { }

      // admin authentication
      async authenticateAdmin(credential: AuthDto): Promise<IAuthResult> {

        if(credential.auth_token) {
            let token = await this.dbMediatorService.fetchOne <IAuthKey> ({token: credential.auth_token}, {
                db : "naijasave",
                collection : "auth_tokens"
            });

            if(token) {
                if(this.tokenIsExpired(token.expires)) {
                    return await this.checkAndUseAdminLoginDetails(credential);
                } else {
                    return {authenticated: true, authToken: token.token, for: token.for };
                }
            } else {
                return await this.checkAndUseAdminLoginDetails(credential);
            }
        } else {
            return await this.checkAndUseAdminLoginDetails(credential);
        }
      }

      private async checkAndUseAdminLoginDetails(credential: AuthDto): Promise<IAuthResult> {
        if(credential.login && credential.password) {
            return await this.authenticateAdminWithLoginCredentials({
                login: credential.login, 
                password: credential.password,
                remember: credential.remember && credential.remember == "true" ? true : false
            });
        } else {
            return {authenticated: false, reason: "Missing credentials"};
        }
      }

      private async authenticateAdminWithLoginCredentials(credential: {login: string, password: string, remember: boolean}): Promise<IAuthResult> {
        let admin = await this.dbMediatorService.fetchOne <AdminDto>(
            {"credentials.phoneNumber": credential.login},
            {db: "naijasave", collection :"admins"}
            );

        if(!admin) {
            return {authenticated: false, reason: "Phone number not recognized"}
        }

        if(admin.credentials.password !== credential.password) {
            return {authenticated: false, reason: "Password incorrect"}
        }

        // generate token for user, save the token and return it
        let token = IdGenerator.generateAuthToken();
        let longDays = 60; // two months
        let shortDays = 1; // one day

        // check if there is an auth key for this user that has not expired
        let savedToken = await this.dbMediatorService.fetchOne <IAuthKey>({for: admin._id}, {
            db : "naijasave",
            collection : "auth_tokens"
        });

        if(savedToken) {

            if(!this.tokenIsExpired(savedToken.expires)) {
                await this.dbMediatorService.updateOne <IAuthKey> ({for: admin._id}, {$set: {
                    expires: credential.remember ? 
                                            String((86400000 * longDays) + Date.now()) : 
                                            String((86400000 * shortDays) + Date.now())
                }}, {
                    db : "naijasave",
                    collection : "auth_tokens"
                });

                return {authenticated: true, authToken: savedToken.token};
            }

        }

        let key: IAuthKey = {
            _id : IdGenerator.generateKey(12),
            token: token,
            expires: credential.remember ? 
                        String((86400000 * longDays) + Date.now()) : 
                        String((86400000 * shortDays) + Date.now()),
            created: new Date().toISOString(),
            for: admin._id
        }

        await this.dbMediatorService.insertOne <IAuthKey> (key, {
            db : "naijasave",
            collection : "auth_tokens"
        });

        return {authenticated: true, authToken: token};
    }

      // contributor authentication
    
      async authenticateContributor(credential: AuthDto): Promise<IAuthResult> {
        if(credential.auth_token) {
            let token = await this.dbMediatorService.fetchOne <IAuthKey>({token: credential.auth_token}, {
                db : "naijasave",
                collection : "auth_tokens"
            });

            if(token) {
                if(this.tokenIsExpired(token.expires)) {
                    return await this.checkAndUseContributorLoginDetails(credential);
                } else {
                    return {authenticated: true, authToken: token.token, for: token.for };
                }
            } else {
                return await this.checkAndUseContributorLoginDetails(credential);
            }
        } else {
            return await this.checkAndUseContributorLoginDetails(credential);
        }
      }

      private async checkAndUseContributorLoginDetails(credential: AuthDto): Promise<IAuthResult> {
        if(credential.login && credential.password) {
            return await this.authenticateContributorWithLoginCredentials({
                login: credential.login, 
                password: credential.password,
                remember: credential.remember && credential.remember == "true" ? true : false
            });
        } else {
            return {authenticated: false, reason: "Missing credentials"};
        }
      }

      private tokenIsExpired(tokenExpiryDate): boolean {
          let now = Date.now();
          let xpiryDate = Number(tokenExpiryDate);
          return now > xpiryDate ? true : false;
      }

      private async authenticateContributorWithLoginCredentials(credential: {login: string, password: string, remember: boolean}): Promise<IAuthResult> {

        let contributor = await this.dbMediatorService.fetchOne<ContributorDto>({"credentials.phoneNumber": credential.login}, {
            db : "naijasave",
            collection : "contributors"
        });

        if(!contributor) {
            contributor = await this.dbMediatorService.fetchOne <ContributorDto>({"credentials.username": credential.login}, {
                db :"naijasave",
                collection : "contributors"
            })
        }

        if(!contributor) {
            return {authenticated: false, reason: "Phone number or username not recognized"}
        }



        if(contributor.credentials.password !== credential.password) {
            return {authenticated: false, reason: "Password incorrect"}
        }

        // generate token for user, save the token and return it
        let token = IdGenerator.generateAuthToken();
        let longDays = 60; // two months
        let shortDays = 1; // one day

        // check if there is an auth key for this user that has not expired
        let savedToken = await this.dbMediatorService.fetchOne <IAuthKey>({for: contributor._id}, {
            db : "naijasave",
            collection : "auth_tokens"
        });

        if(savedToken) {

            if(!this.tokenIsExpired(savedToken.expires)) {
                await this.dbMediatorService.updateOne <IAuthKey>({for: contributor._id}, {$set: {
                    expires: credential.remember ? 
                                            String((86400000 * longDays) + Date.now()) : 
                                            String((86400000 * shortDays) + Date.now())
                }}, {
                    db : "naijasave",
                    collection : "auth_tokens"
                });

                return {authenticated: true, authToken: savedToken.token};
            }

        }

        let key: IAuthKey = {
            _id : IdGenerator.generateKey(12),
            token: token,
            expires: credential.remember ? 
                        String((86400000 * longDays) + Date.now()) : 
                        String((86400000 * shortDays) + Date.now()),
            created: new Date().toISOString(),
            for: contributor._id
        }

        await this.dbMediatorService.insertOne <IAuthKey>(key, {
            db : "naijasave",
            collection : "auth_tokens"
        });

        return {authenticated: true, authToken: token};
    }

}
