import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ContributorDto } from 'src/modules/shared/dto/contributor/contributor-dto';
import { IdGenerator } from 'src/modules/shared/helpers/id-generator/id-generator';
import { EntityIdentity, OperationFeedback, PasswordResetData, PasswordResetVerificationCode } from 'src/modules/shared/interface/shared-interfaces';
import { DbMediatorService } from '../db-mediator/db-mediator.service';
import { EntitiesMediatorService } from '../entities-mediator/entities-mediator/entities-mediator.service';
import { SmsMediatorService } from '../sms-mediator/sms-mediator/sms-mediator.service';

@Injectable()
export class PasswordResetService {
    constructor(
        private entitiesMediatorService: EntitiesMediatorService,
        private dbMediatorService: DbMediatorService,
        private smsMediatorService : SmsMediatorService
    ) {}

    async getPassword(entityPhoneNumber: string): Promise<OperationFeedback> {
        let contributor = await this.dbMediatorService.fetchOne<ContributorDto>({
            "credentials.phoneNumber" : entityPhoneNumber
        }, {db : "naijasave", collection : "contributors"})

        if(contributor) {
            return {success: true, message: "successful", data: contributor.credentials.password}
        } else {
            throw new HttpException("Could not find password for the provided phone number", HttpStatus.BAD_REQUEST)
        }
    }

    async getPasswordResetVerificationCode(phoneNumber: string): Promise<OperationFeedback> {
        
        let contributor = await this.dbMediatorService.fetchOne<ContributorDto>({
            "credentials.phoneNumber" : phoneNumber
        }, {db : "naijasave", collection : "contributors"})

        if(!contributor) {
            return {
                success: false,
                message: "Cannot recognize the phone number provided"
            }
        } else {
            let verificationCode = new PasswordResetVerificationCode();
            
            verificationCode.code = String(IdGenerator.getRand(99999));
            verificationCode.phoneNumber = phoneNumber;
            verificationCode.created = new Date().toISOString();

            // send sms to user
            return await this.smsMediatorService.messageRecipients({
                message :  `Your password reset code is ${verificationCode.code}. Expires after ${(verificationCode.expiresAfter /   1000) / 60} mins`,
                recipients : [phoneNumber]
            }).then(async r => {
                if(r.success) {

                    // save verification code in db
                    await this.dbMediatorService.insertOne<PasswordResetVerificationCode>(verificationCode, {
                        db : "naijasave",
                        collection : "password-reset-verification-codes"
                    }).then(r => {
                        // set a timeout that deletes this verification code after the specified expiresAfter
                        setTimeout(async () => {
                            await this.dbMediatorService.deleteOne<PasswordResetVerificationCode>({
                                "code" : verificationCode.code
                            }, {
                                db : "naijasave",
                                collection : "password-reset-verification-codes"
                            })
                        }, Number(verificationCode.expiresAfter))
                    });

                    return {
                        success : true,
                        message : "Password Reset Code generated and sent to user"
                    } 
                } else {
                    return {
                        success : false,
                        message : "Password reset code not sent. Please retry"
                    }
                }
            })

            
        }
    }

    async resetPassword(payload : PasswordResetData) : Promise<OperationFeedback> {
        let verificationCode = await this.dbMediatorService.fetchOne<PasswordResetVerificationCode>({
            code : payload.verificationCode
        }, {db : "naijasave", collection : "password-reset-verification-codes"});

        if(!verificationCode) {
            throw new HttpException("Wrong verification code provided", HttpStatus.BAD_REQUEST);
        }

        await this.dbMediatorService.updateOne<ContributorDto>({"credentials.phoneNumber" : payload.phoneNumber}, {
            $set: {"credentials.password" : payload.newPassword}
        }, {db : "naijasave", collection : "contributors"})

        // delete verification code
        await this.dbMediatorService.deleteOne<PasswordResetVerificationCode>({code : payload.verificationCode}, {
            db : "naijasave",
            collection : "password-reset-verification-codes"
        });

        return {
            success : true,
            message : "Password updated successfully!"
        }
    }

    async checkVerificationCode(payload : {phoneNumber : string, verificationCode : string}) : Promise<OperationFeedback> {
        let verificationCode = await this.dbMediatorService.fetchOne<PasswordResetVerificationCode>({
            code : payload.verificationCode
        }, {db : "naijasave" , collection : "password-reset-verification-codes"});

        if(!verificationCode) {
            throw new HttpException("Invalid verification code provided", HttpStatus.BAD_REQUEST);
        } else {
            return {success : true, message : "Verified"}
        }     
    }
}
