import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { AdminDto } from 'src/modules/shared/dto/admin/admin-dto';
import { ContributorDto } from 'src/modules/shared/dto/contributor/contributor-dto';
import { DepositRequestDto } from 'src/modules/shared/dto/deposit-request/deposit-request-dto';
import { PaymentDto } from 'src/modules/shared/dto/payment/payment-dto';
import { SignupRequestDto } from 'src/modules/shared/dto/signup-request/signup-request-dto';
import { WithdrawalRequestDto } from 'src/modules/shared/dto/withdrawal-request/withdrawal-request-dto';
import { IFetchEntity, OperationFeedback, Placeholders, SMSFormat, SMSProforma } from 'src/modules/shared/interface/shared-interfaces';
import { DbMediatorService } from '../../db-mediator/db-mediator.service';
import { EntitiesMediatorService } from '../../entities-mediator/entities-mediator/entities-mediator.service';

const Vonage = require('@vonage/server-sdk')
const axios: AxiosInstance = require("axios")

@Injectable()
export class SmsMediatorService {
    private sender = "Naijasave";
    private multiTexterUrl = "https://app.multitexter.com/v2/app/sms";
    private vonage: typeof Vonage;
    constructor(
        @Inject('VONAGE_API_KEY') private vonage_api_key: string,
        @Inject('VONAGE_API_SECRET') private vonage_api_secret: string,
        private dbMediatorService: DbMediatorService,
        private entitiesMediatorService: EntitiesMediatorService
    ) {
        this.vonage = new Vonage({
            apiKey: this.vonage_api_key,
            apiSecret: this.vonage_api_secret
        })
    }

    async sendDepositRequestSms(request: DepositRequestDto) {
        let proforma = await this.dbMediatorService.fetchSMSProforma({for: "deposit-requests"});

        if(!proforma) {
            return;
        }

        let requester = await this.entitiesMediatorService.fetchEntity(request.requester_id);

        let message = this.formatMessage({
            proforma: proforma,
            $name: requester.entity.basicInformation.name
        });

        this.sendSMS(this.sender, requester.entity.credentials.phoneNumber, message); // send sms to requester
    }

    async sendWithdrawalRequestSms(request: WithdrawalRequestDto) {
        let proforma = await this.dbMediatorService.fetchSMSProforma({for: "withdrawal-requests"});

        if(!proforma) {
            return;
        }

        let requester = await this.entitiesMediatorService.fetchEntity(request.requester_id);

        let message = this.formatMessage({
            proforma: proforma,
            $name: requester.entity.basicInformation.name
        });

        this.sendSMS(this.sender, requester.entity.credentials.phoneNumber, message); // send sms to requester
    }

    async sendSignupRequestApprovalSMS(signupRequest: SignupRequestDto) {
        let proforma = await this.dbMediatorService.fetchOne <SMSProforma> (
            {"for": "signups"}, {collection: "sms-proformas", db: "naijasave"}
        )

        if(!proforma) {
            return;
        }  
        
        let message = this.formatMessage({
            proforma: proforma,
            $name: signupRequest.name
        });

        this.sendSMS(this.sender, signupRequest.phoneNumber, message);
    }

    async sendTransactionAlert(payload: PaymentDto) {
        let proforma: SMSProforma;

        if (payload.to.toUpperCase() !== "NAIJASAVE") {
            // Prepare and send Receiver's SMS
            if(payload.purpose == "DailySavings") {
                proforma = await this.dbMediatorService.fetchSMSProforma({for: "daily-savings"});
            } else {
                // it is other transaction
                proforma = await this.dbMediatorService.fetchSMSProforma({for: "credits"});
            }
    
            if(!proforma) {
                return;
            }

            let receiver = await this.entitiesMediatorService.fetchEntity(payload.to);
            let receiverMessage = this.formatMessage({
                proforma: proforma,
                $balance: receiver.entity.account.balance,
                $amount: payload.amount,
                $name: receiver.entity.basicInformation.name,
                $statement: payload.statement
            });  
            
            this.sendSMS(this.sender, receiver.entity.credentials.phoneNumber, receiverMessage); // send sms to receiver
        }

        if (payload.from.toUpperCase() !== "NAIJASAVE") {
            // Prepare and send Sender's SMS
            proforma = await this.dbMediatorService.fetchSMSProforma({for: "debits"});

            let sender = await this.entitiesMediatorService.fetchEntity(payload.from);
            let senderMessage = this.formatMessage({
                proforma: proforma,
                $balance: sender.entity.account.balance,
                $amount: payload.amount,
                $name: sender.entity.basicInformation.name,
                $statement: payload.statement
            });  
            
            this.sendSMS(this.sender, sender.entity.credentials.phoneNumber, senderMessage); // send sms to sender 
        }

    }

    async messageRecipients(payload: {message: string, recipients: Array<string>}): Promise<OperationFeedback> {
        let hasPlaceholders = false;
        Placeholders.forEach(placeholder => {
            if(payload.message.includes(placeholder)) {
                hasPlaceholders = true;
            }
        });

        if(hasPlaceholders) {
            let deliveryData = {
                totalSent : 0,
                totalNotSent : 0
            }
            
            payload.recipients.forEach( async recipientPhoneNumber => {
                let recipient = await this.dbMediatorService.fetchContributor({
                    "credentials.phoneNumber": recipientPhoneNumber
                });

                if(recipient) {
                    let message = this.fillPlaceholdersInMessage(payload.message, recipient)
                    try {
                       await this.sendSMS(this.sender, recipientPhoneNumber, message) 
                       deliveryData.totalSent++
                    } catch(e : any) {
                        deliveryData.totalNotSent++
                    }
                    
                }
            })
            return {
                success : true,
                message : "SMS Sent successfully",
                data : deliveryData
            }
        } else {
            return await this.sendSMS(this.sender, payload.recipients.join(","), payload.message)
        }
    }

    async sendAccountChangeSMS(recipient_id: string, sms_proforma: SMSProforma) {
        let recipient = await this.dbMediatorService.fetchContributor({_id: recipient_id})

        // define account type
        let accountType = "";
        if(recipient.identity.isSubContributor) {
            accountType = "Sub Contributor"
        }
        if(recipient.identity.isSuperContributor) {
            accountType = "Super Contributor"
        }
        if(recipient.identity.isContributor) {
            accountType = "Contributor"
        }
        if(recipient.identity.isInvestor) {
            accountType = "Investor"
        }

        if(!sms_proforma) {
            return;
        }

        let message = this.formatMessage({
            $name: recipient.basicInformation.name,
            $account_type: accountType,
            proforma: sms_proforma
        });

        this.sendSMS(this.sender, recipient.credentials.phoneNumber, message); // send sms
    }


    private formatMessage(payload: SMSFormat): string {
        // Dear $name, You have been elevated to $account_type. You can now see and manage subordinates.
        // $name & $account-type
        let message = payload.proforma.message;
        message = message.replace(/\$name/g, payload.$name);
        message = message.replace(/\$account_type/g, payload.$account_type);
        message = message.replace(/\$statement/g, payload.$statement);
        message = message.replace(/\$balance/g, payload.$balance.toString());
        message = message.replace(/\$action/g, payload.$action);
        message = message.replace(/\$amount/g, payload.$amount.toString());
        return message;
    }

    private fillPlaceholdersInMessage(message: string, recipientData: ContributorDto | AdminDto): string {
        // Dear $name, You have been elevated to $account_type. You can now see and manage subordinates.
        // $name & $account-type
        
        // define account type
        let accountType = "";
        if((<ContributorDto>recipientData).identity.isContributor) {
            accountType = "Contributor"
        } else if((<ContributorDto>recipientData).identity.isInvestor) {
            accountType = "Investor"
        } else if((<ContributorDto>recipientData).identity.isSubContributor) {
            accountType = "Sub Contributor"
        } else if((<ContributorDto>recipientData).identity.isSuperContributor) {
            accountType = "Super Contributor"
        } else {
            accountType = "Admin"
        }

        message = message.replace(/\$name/g, recipientData.basicInformation.name);
        message = message.replace(/\$account_type/g, accountType);
        message = message.replace(/\$balance/g, recipientData.account.balance.toString());
        return message;
    }


    private async sendSMS(sender, recipient: string, message: string) : Promise<OperationFeedback> {

        if (!recipient || recipient.length < 11 || recipient.length > 11 || isNaN(Number(recipient))) {
            return;
        }
        
        // send using multitexter
        let multiTexterData = {
            email: "robota455@gmail.com",
            password: "gr33nkrypt0n",
            sender_name: this.sender,
            recipients: recipient,
            message: message
        }

        return axios.post(this.multiTexterUrl, multiTexterData).then(r => {
            return {success : true, message : "SMS sent"}
        }).catch( e => {
            return {success : false, message : "SMS not sent"}
        })
    }

    
}
