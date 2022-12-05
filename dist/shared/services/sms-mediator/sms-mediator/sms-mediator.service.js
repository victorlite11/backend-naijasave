"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsMediatorService = void 0;
const common_1 = require("@nestjs/common");
const admin_dto_1 = require("../../../dto/admin/admin-dto");
const contributor_dto_1 = require("../../../dto/contributor/contributor-dto");
const deposit_request_dto_1 = require("../../../dto/deposit-request/deposit-request-dto");
const payment_dto_1 = require("../../../dto/payment/payment-dto");
const signup_request_dto_1 = require("../../../dto/signup-request/signup-request-dto");
const withdrawal_request_dto_1 = require("../../../dto/withdrawal-request/withdrawal-request-dto");
const shared_interfaces_1 = require("../../../interface/shared-interfaces");
const db_mediator_service_1 = require("../../db-mediator/db-mediator.service");
const entities_mediator_service_1 = require("../../entities-mediator/entities-mediator/entities-mediator.service");
const Vonage = require('@vonage/server-sdk');
const axios = require("axios");
let SmsMediatorService = class SmsMediatorService {
    constructor(vonage_api_key, vonage_api_secret, dbMediatorService, entitiesMediatorService) {
        this.vonage_api_key = vonage_api_key;
        this.vonage_api_secret = vonage_api_secret;
        this.dbMediatorService = dbMediatorService;
        this.entitiesMediatorService = entitiesMediatorService;
        this.sender = "Naijasave";
        this.multiTexterUrl = "https://app.multitexter.com/v2/app/sms";
        this.vonage = new Vonage({
            apiKey: this.vonage_api_key,
            apiSecret: this.vonage_api_secret
        });
    }
    async sendDepositRequestSms(request) {
        let proforma = await this.dbMediatorService.fetchSMSProforma({ for: "deposit-requests" });
        if (!proforma) {
            return;
        }
        let requester = await this.entitiesMediatorService.fetchEntity(request.requester_id);
        let message = this.formatMessage({
            proforma: proforma,
            $name: requester.entity.basicInformation.name
        });
        this.sendSMS(this.sender, requester.entity.credentials.phoneNumber, message);
    }
    async sendWithdrawalRequestSms(request) {
        let proforma = await this.dbMediatorService.fetchSMSProforma({ for: "withdrawal-requests" });
        if (!proforma) {
            return;
        }
        let requester = await this.entitiesMediatorService.fetchEntity(request.requester_id);
        let message = this.formatMessage({
            proforma: proforma,
            $name: requester.entity.basicInformation.name
        });
        this.sendSMS(this.sender, requester.entity.credentials.phoneNumber, message);
    }
    async sendSignupRequestApprovalSMS(signupRequest) {
        let proforma = await this.dbMediatorService.fetchOne({ "for": "signups" }, { collection: "sms-proformas", db: "naijasave" });
        if (!proforma) {
            return;
        }
        let message = this.formatMessage({
            proforma: proforma,
            $name: signupRequest.name
        });
        this.sendSMS(this.sender, signupRequest.phoneNumber, message);
    }
    async sendTransactionAlert(payload) {
        let proforma;
        if (payload.purpose == "DailySavings") {
            proforma = await this.dbMediatorService.fetchSMSProforma({ for: "daily-savings" });
        }
        else {
            proforma = await this.dbMediatorService.fetchSMSProforma({ for: "credits" });
        }
        if (!proforma) {
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
        proforma = await this.dbMediatorService.fetchSMSProforma({ for: "debits" });
        let sender = await this.entitiesMediatorService.fetchEntity(payload.from);
        let senderMessage = this.formatMessage({
            proforma: proforma,
            $balance: sender.entity.account.balance,
            $amount: payload.amount,
            $name: sender.entity.basicInformation.name,
            $statement: payload.statement
        });
        this.sendSMS(this.sender, receiver.entity.credentials.phoneNumber, receiverMessage);
        this.sendSMS(this.sender, sender.entity.credentials.phoneNumber, senderMessage);
    }
    async messageRecipients(payload) {
        let hasPlaceholders = false;
        shared_interfaces_1.Placeholders.forEach(placeholder => {
            if (payload.message.includes(placeholder)) {
                hasPlaceholders = true;
            }
        });
        if (hasPlaceholders) {
            let deliveryData = {
                totalSent: 0,
                totalNotSent: 0
            };
            payload.recipients.forEach(async (recipientPhoneNumber) => {
                let recipient = await this.dbMediatorService.fetchContributor({
                    "credentials.phoneNumber": recipientPhoneNumber
                });
                if (recipient) {
                    let message = this.fillPlaceholdersInMessage(payload.message, recipient);
                    try {
                        await this.sendSMS(this.sender, recipientPhoneNumber, message);
                        deliveryData.totalSent++;
                    }
                    catch (e) {
                        deliveryData.totalNotSent++;
                    }
                }
            });
            return {
                success: true,
                message: "SMS Sent successfully",
                data: deliveryData
            };
        }
        else {
            return await this.sendSMS(this.sender, payload.recipients.join(","), payload.message);
        }
    }
    async sendAccountChangeSMS(recipient_id, sms_proforma) {
        let recipient = await this.dbMediatorService.fetchContributor({ _id: recipient_id });
        let accountType = "";
        if (recipient.identity.isSubContributor) {
            accountType = "Sub Contributor";
        }
        if (recipient.identity.isSuperContributor) {
            accountType = "Super Contributor";
        }
        if (recipient.identity.isContributor) {
            accountType = "Contributor";
        }
        if (recipient.identity.isInvestor) {
            accountType = "Investor";
        }
        if (!sms_proforma) {
            return;
        }
        let message = this.formatMessage({
            $name: recipient.basicInformation.name,
            $account_type: accountType,
            proforma: sms_proforma
        });
        this.sendSMS(this.sender, recipient.credentials.phoneNumber, message);
    }
    formatMessage(payload) {
        let message = payload.proforma.message;
        message = message.replace(/\$name/g, payload.$name);
        message = message.replace(/\$account_type/g, payload.$account_type);
        message = message.replace(/\$statement/g, payload.$statement);
        message = message.replace(/\$balance/g, payload.$balance.toString());
        message = message.replace(/\$action/g, payload.$action);
        message = message.replace(/\$amount/g, payload.$amount.toString());
        return message;
    }
    fillPlaceholdersInMessage(message, recipientData) {
        let accountType = "";
        if (recipientData.identity.isContributor) {
            accountType = "Contributor";
        }
        else if (recipientData.identity.isInvestor) {
            accountType = "Investor";
        }
        else if (recipientData.identity.isSubContributor) {
            accountType = "Sub Contributor";
        }
        else if (recipientData.identity.isSuperContributor) {
            accountType = "Super Contributor";
        }
        else {
            accountType = "Admin";
        }
        message = message.replace(/\$name/g, recipientData.basicInformation.name);
        message = message.replace(/\$account_type/g, accountType);
        message = message.replace(/\$balance/g, recipientData.account.balance.toString());
        return message;
    }
    async sendSMS(sender, recipient, message) {
        if (!recipient || recipient.length < 11 || recipient.length > 11 || isNaN(Number(recipient))) {
            return;
        }
        let multiTexterData = {
            email: "robota455@gmail.com",
            password: "gr33nkrypt0n",
            sender_name: this.sender,
            recipients: recipient,
            message: message
        };
        return axios.post(this.multiTexterUrl, multiTexterData).then(r => {
            return { success: true, message: "SMS sent" };
        }).catch(e => {
            return { success: false, message: "SMS not sent" };
        });
    }
};
SmsMediatorService = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject('VONAGE_API_KEY')),
    __param(1, common_1.Inject('VONAGE_API_SECRET')),
    __metadata("design:paramtypes", [String, String, db_mediator_service_1.DbMediatorService,
        entities_mediator_service_1.EntitiesMediatorService])
], SmsMediatorService);
exports.SmsMediatorService = SmsMediatorService;
//# sourceMappingURL=sms-mediator.service.js.map