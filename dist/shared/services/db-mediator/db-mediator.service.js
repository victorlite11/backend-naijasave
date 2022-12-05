"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbMediatorService = void 0;
const common_1 = require("@nestjs/common");
const mongodb_1 = require("mongodb");
const admin_dto_1 = require("../../dto/admin/admin-dto");
const announcements_dto_1 = require("../../dto/announcements/announcements-dto");
const chat_dto_1 = require("../../dto/chat/chat-dto");
const company_dto_1 = require("../../dto/company/company-dto");
const contributor_dto_1 = require("../../dto/contributor/contributor-dto");
const deposit_request_dto_1 = require("../../dto/deposit-request/deposit-request-dto");
const payment_dto_1 = require("../../dto/payment/payment-dto");
const signup_request_dto_1 = require("../../dto/signup-request/signup-request-dto");
const withdrawal_request_dto_1 = require("../../dto/withdrawal-request/withdrawal-request-dto");
const shared_interfaces_1 = require("../../interface/shared-interfaces");
let DbMediatorService = class DbMediatorService {
    constructor() {
        this.uri = "mongodb://127.0.0.1:27017";
        this.dbName = "naijasave";
        this.collections = {
            signupRequests: "signup_requests",
            depositRequests: "deposit_requests",
            withdrawalRequests: "withdrawal_requests",
            contributors: "contributors",
            smsProformas: "sms-proformas",
            admins: "admins",
            chats: "chats",
            company: "company",
            announcements: "announcements",
            ongoingTransactions: "ongoing_transactions",
            failedTransactions: "failed_transactions",
            successfulTransactions: "successful_transactions",
            authTokens: "auth_tokens"
        };
        this.sessionTransactionOptions = {
            readPreference: 'primary',
            readConcern: { level: 'local' },
            writeConcern: { w: 'majority' }
        };
    }
    async fetchOne(query, dbLookupData) {
        try {
            return await this.openConnection(dbLookupData.uri).then(async (client) => {
                try {
                    const collection = await client.db(dbLookupData.db).collection(dbLookupData.collection);
                    return await collection.findOne(query);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchAll(query, dbLookupData) {
        try {
            return await this.openConnection(dbLookupData.uri).then(async (client) => {
                try {
                    const collection = await client.db(dbLookupData.db).collection(dbLookupData.collection);
                    return await collection.find(query).toArray();
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async insertOne(doc, dbLookupData) {
        try {
            return await this.openConnection(dbLookupData.uri).then(async (client) => {
                try {
                    const collection = await client.db(dbLookupData.db).collection(dbLookupData.collection);
                    await collection.insertOne(doc);
                    return { success: true, message: "Insertion Successful", data: doc };
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async updateOne(filter, update, dbLookupData) {
        try {
            return await this.openConnection(dbLookupData.uri).then(async (client) => {
                try {
                    const collection = client.db(dbLookupData.db).collection(dbLookupData.collection);
                    await collection.updateOne(filter, update);
                    return { success: true, message: "Document Updated Successfully" };
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async deleteOne(query, dbLookupData) {
        try {
            return await this.openConnection(dbLookupData.uri).then(async (client) => {
                try {
                    const collection = await client.db(dbLookupData.db).collection(dbLookupData.collection);
                    await collection.deleteOne(query);
                    return { success: true, message: "Deletion Successful" };
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async insertAuthToken(authKeyObject) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.authTokens);
                    await collection.insertOne(authKeyObject);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchAuthToken(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.authTokens);
                    return await collection.findOne(query);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async updateAuthToken(tokenQuery, update) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.authTokens);
                    await collection.updateMany(tokenQuery, update);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async deleteToken(query) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.authTokens);
                    await collection.deleteOne(query);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async insertInSuccessfulTransactions(payment) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.successfulTransactions);
                    await collection.insertOne(payment);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchAllSuccessfulTransactions() {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.successfulTransactions);
                    return await collection.find({}).toArray();
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchSuccessfulTransactions(contributor_id) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.successfulTransactions);
                    return await collection.find({ $or: [{ from: contributor_id }, { to: contributor_id }] }).toArray();
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchSuccessfulTransaction(payment_id) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.successfulTransactions);
                    return await collection.findOne({ _id: payment_id });
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async deleteFromSuccessfulTransactions(id) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.successfulTransactions);
                    await collection.deleteOne({ _id: id });
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async insertInFailedTransactions(payment) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.failedTransactions);
                    await collection.insertOne(payment);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async deleteFromFailedTransactions(id) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.failedTransactions);
                    await collection.deleteOne({ _id: id });
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async insertInOngoingTransactions(payment) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.ongoingTransactions);
                    await collection.insertOne(payment);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async deleteFromOngoingTransactions(id) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.ongoingTransactions);
                    await collection.deleteOne({ _id: id });
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async updateAdminAccount(payload) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    await this.useSession(client).then(async (session) => {
                        try {
                            let trxResult = await session.withTransaction(async () => {
                                const collection = client.db(this.dbName).collection(this.collections.admins);
                                await collection.updateOne({ _id: payload._id }, { $set: { "account.balance": payload.account.balance } });
                            }, {
                                readPreference: 'primary',
                                readConcern: { level: 'local' },
                                writeConcern: { w: 'majority' }
                            });
                        }
                        catch (e) {
                            console.error(e);
                        }
                        finally {
                            await this.endSession(session);
                        }
                    });
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async updateContributorAccount(payload) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    await this.useSession(client).then(async (session) => {
                        try {
                            let trxResult = await session.withTransaction(async () => {
                                const collection = client.db(this.dbName).collection(this.collections.contributors);
                                await collection.updateOne({ _id: payload._id }, { $set: { "account.balance": payload.account.balance } });
                            }, {
                                readPreference: 'primary',
                                readConcern: { level: 'local' },
                                writeConcern: { w: 'majority' }
                            });
                        }
                        catch (e) {
                            console.error(e);
                        }
                        finally {
                            await this.endSession(session);
                        }
                    });
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async registerContributorAction(payload) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.contributors);
                    await collection.updateOne({ _id: payload._id }, { $push: { "activities.actions": payload.newAction } });
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async registerAdminAction(payload) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.admins);
                    await collection.updateOne({ _id: payload._id }, { $push: { "activities.actions": payload.newAction } });
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchContributor(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.contributors);
                    return await collection.findOne(query);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchContributors(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.contributors);
                    return await collection.find(query).toArray();
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async createContributor(signupRequestId, contributor) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    await this.useSession(client).then(async (session) => {
                        try {
                            let trx = await session.withTransaction(async () => {
                                const contributorsCollection = client.db(this.dbName).collection(this.collections.contributors);
                                const signupsCollections = client.db(this.dbName).collection(this.collections.signupRequests);
                                await contributorsCollection.insertOne(contributor);
                                await signupsCollections.deleteOne({ _id: signupRequestId });
                                let action = {
                                    description: 'Account registration',
                                    date: contributor.activities.regDate,
                                    type: {
                                        is: "AccountRegistration"
                                    }
                                };
                                let actionTwo = {
                                    description: 'Account registration approval',
                                    date: new Date().toISOString(),
                                    type: {
                                        is: "AccountApproval"
                                    }
                                };
                                await contributorsCollection.updateOne({ _id: contributor._id }, { $push: { "activities.actions": action } });
                                await contributorsCollection.updateOne({ _id: contributor._id }, { $push: { "activities.actions": actionTwo } });
                            }, {
                                readPreference: 'primary',
                                readConcern: { level: 'local' },
                                writeConcern: { w: 'majority' }
                            });
                        }
                        catch (e) {
                            console.error(e);
                        }
                        finally {
                            this.endSession(session);
                        }
                    });
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async deleteContributor(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.contributors);
                    return await collection.deleteOne(query);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async insertSignupRequest(req) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    const signupsCollection = await client.db(this.dbName).collection(this.collections.signupRequests);
                    await signupsCollection.insertOne(req);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async replaceSignupRequest(query, req) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const signupsCollection = await client.db(this.dbName).collection(this.collections.signupRequests);
                    await signupsCollection.replaceOne(query, req);
                    return { success: true, message: "Signup Request Updated" };
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchSignupRequest(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const signupsCollection = await client.db(this.dbName).collection(this.collections.signupRequests);
                    return await signupsCollection.findOne(query);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchSignupRequests(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const signupsCollection = await client.db(this.dbName).collection(this.collections.signupRequests);
                    return await signupsCollection.find(query).toArray();
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async deleteSignupRequest(id) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    const signupsCollection = await client.db(this.dbName).collection(this.collections.signupRequests);
                    await signupsCollection.deleteOne({ _id: id });
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async insertDepositRequest(req) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    const depositsCollection = await client.db(this.dbName).collection(this.collections.depositRequests);
                    await depositsCollection.insertOne(req);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async updateDepositRequest(filter, update) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.depositRequests);
                    await collection.updateOne(filter, update);
                    return { success: true, message: "Request Updated Successfully" };
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async deleteDepositRequest(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const depositsCollection = await client.db(this.dbName).collection(this.collections.depositRequests);
                    await depositsCollection.deleteOne(query);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchDepositRequest(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const depositsCollection = await client.db(this.dbName).collection(this.collections.depositRequests);
                    return await depositsCollection.findOne(query);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchDepositRequests(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const depositsCollection = await client.db(this.dbName).collection(this.collections.depositRequests);
                    return await depositsCollection.find(query).toArray();
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async insertWithdrawalRequest(req) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    const withdrawalsCollection = await client.db(this.dbName).collection(this.collections.withdrawalRequests);
                    await withdrawalsCollection.insertOne(req);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async updateWithdrawalRequest(filter, update) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.withdrawalRequests);
                    await collection.updateOne(filter, update);
                    return { success: true, message: "Request Updated Successfully" };
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchWithdrawalRequest(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const withdrawalsCollection = await client.db(this.dbName).collection(this.collections.withdrawalRequests);
                    return await withdrawalsCollection.findOne(query);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async deleteWithdrawalRequest(query) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    const withdrawalsCollection = await client.db(this.dbName).collection(this.collections.withdrawalRequests);
                    await withdrawalsCollection.deleteOne(query);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchWithdrawalRequests(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const withdrawalsCollection = await client.db(this.dbName).collection(this.collections.withdrawalRequests);
                    return await withdrawalsCollection.find(query).toArray();
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchAnnouncements(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const announcementsCollection = await client.db(this.dbName).collection(this.collections.announcements);
                    return await announcementsCollection.find(query).toArray();
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchAnnouncement(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const announcementsCollection = await client.db(this.dbName).collection(this.collections.announcements);
                    return await announcementsCollection.findOne(query);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async deleteAnnouncement(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const announcementsCollection = await client.db(this.dbName).collection(this.collections.announcements);
                    await announcementsCollection.deleteOne(query);
                    return { success: true, message: "Annnouncement Deleted Successfully" };
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async replaceAnnouncement(query, new_announcement) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const announcementsCollection = await client.db(this.dbName).collection(this.collections.announcements);
                    await announcementsCollection.replaceOne(query, new_announcement);
                    return { success: true, message: "Update Successful" };
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async insertAnnouncement(announcement) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    const announcementsCollection = await client.db(this.dbName).collection(this.collections.announcements);
                    await announcementsCollection.insertOne(announcement);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchContributorPrivilege(contributor_id) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.contributors);
                    let c = await collection.findOne({ _id: contributor_id });
                    return c.privilege;
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async updateContributor(filter, update) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.contributors);
                    await collection.updateOne(filter, update);
                    return { success: true, message: "Privilege Updated Successfully" };
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchContributorIdentity(contributor_id) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.contributors);
                    let c = await collection.findOne({ _id: contributor_id });
                    return c.identity;
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async assignSubordinates(new_overseer_id, subordinates_id_list) {
        let response;
        try {
            await this.openConnection().then(async (client) => {
                try {
                    await this.useSession(client).then(async (session) => {
                        try {
                            let trxResult = await session.withTransaction(async () => {
                                const collection = client.db(this.dbName).collection(this.collections.contributors);
                                for (let id of subordinates_id_list) {
                                    await collection.updateOne({ _id: id }, { $set: { "basicInformation.overseerId": new_overseer_id } });
                                }
                                response = { success: true, message: "Subordinates Overseer Updated Successfully" };
                            }, {
                                readPreference: 'primary',
                                readConcern: { level: 'local' },
                                writeConcern: { w: 'majority' }
                            });
                        }
                        catch (e) {
                            console.error(e);
                        }
                        finally {
                            await this.endSession(session);
                        }
                    });
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
            return response;
        }
        catch (e) {
            console.error(e);
        }
    }
    async updateContributorReferral(filter, update) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.contributors);
                    await collection.updateOne(filter, update);
                    return { success: true, message: "Privilege Updated Successfully" };
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async updateContributorPaymentTicks(filter, update) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.contributors);
                    await collection.updateOne(filter, update);
                    return { success: true, message: "Payment Ticks Updated Successfully" };
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async insertAdmin(adminObject) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.admins);
                    await collection.insertOne(adminObject);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchAdmin(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.admins);
                    return await collection.findOne(query);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchAdmins(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.admins);
                    return await collection.find(query).toArray();
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async updateAdmin(query, update) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.admins);
                    await collection.updateOne(query, update);
                    return { success: true, message: "Admin updated successfully!" };
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async insertNewCompanyData(companyObject) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.company);
                    await collection.insertOne(companyObject);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchCompanyData(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.company);
                    return await collection.findOne(query);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async updateCompanyData(query, update) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.company);
                    await collection.updateOne(query, update);
                    return { success: true, message: "Company information updated successfully!" };
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchChatsContainer(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.chats);
                    return await collection.findOne(query);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchChatsContainers(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.chats);
                    return await collection.find(query).toArray();
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async updateChatsContainer(query, update) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.chats);
                    await collection.updateOne(query, update);
                    return { success: true, message: "Chat Updated Successfully" };
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async insertChatsContainer(chatsContainer) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.chats);
                    await collection.insertOne(chatsContainer);
                    return { success: true, message: "Chat Container Inserted Successfully" };
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async insertSMSProforma(smsProforma) {
        try {
            await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.smsProformas);
                    await collection.insertOne(smsProforma);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchSMSProforma(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.smsProformas);
                    return await collection.findOne(query);
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async fetchSMSProformas(query) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.smsProformas);
                    return await collection.find(query).toArray();
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async updateSMSProforma(query, update) {
        try {
            return await this.openConnection().then(async (client) => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.smsProformas);
                    await collection.updateOne(query, update);
                    return { success: true, message: "SMS Proforma Updated Successfully" };
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    await this.closeConnection(client);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async openConnection(uri) {
        try {
            const client = new mongodb_1.MongoClient(uri || this.uri, {
                compression: { compressors: [`zlib`] },
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            return await client.connect();
        }
        catch (e) {
            console.error(e);
        }
    }
    async closeConnection(client) {
        try {
            await client.close();
        }
        catch (e) {
            console.error(e);
        }
    }
    async useSession(client) {
        let session = await client.startSession();
        return session;
    }
    async endSession(session) {
        try {
            session.endSession();
        }
        catch (e) {
            console.error(e);
        }
    }
};
DbMediatorService = __decorate([
    common_1.Injectable()
], DbMediatorService);
exports.DbMediatorService = DbMediatorService;
//# sourceMappingURL=db-mediator.service.js.map