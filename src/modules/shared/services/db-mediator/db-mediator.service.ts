import { Injectable } from '@nestjs/common';
import { ClientSession, FilterQuery, MongoClient, ObjectId, UpdateQuery } from 'mongodb';
import { AdminAccountModel, AdminDto } from 'src/modules/shared/dto/admin/admin-dto';
import { AnnouncementsDto } from 'src/modules/shared/dto/announcements/announcements-dto';
import { ChatsContainerDto } from 'src/modules/shared/dto/chat/chat-dto';
import { CompanyDto } from 'src/modules/shared/dto/company/company-dto';
import { AccountModel, ActionModel, ContributorDto, IdentityModel, PrivilegeModel } from 'src/modules/shared/dto/contributor/contributor-dto';
import { DepositRequestDto } from 'src/modules/shared/dto/deposit-request/deposit-request-dto';
import { PaymentDto } from 'src/modules/shared/dto/payment/payment-dto';
import { SignupRequestDto } from 'src/modules/shared/dto/signup-request/signup-request-dto';
import { WithdrawalRequestDto } from 'src/modules/shared/dto/withdrawal-request/withdrawal-request-dto';
import { DbLookupData, IAuthKey, IRegisterActionRequest, OperationFeedback, SMSProforma } from 'src/modules/shared/interface/shared-interfaces';
 
@Injectable()
export class DbMediatorService {

    private uri = "mongodb+srv://naijasave:GVh0tOdKAMV0J0u7@cluster0.rx23p.mongodb.net/naijasave?retryWrites=true&w=majority";
    //private uri = "mongodb://127.0.0.1:27017";
    private dbName = "naijasave";
    private collections = {
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
    }
    private sessionTransactionOptions = {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' }
    };


    // CRUD Operations
    async fetchOne <T> (query: FilterQuery<T>, dbLookupData : DbLookupData): Promise<T> {
        try {
            // open connection
            return await this.openConnection(dbLookupData.uri).then(async client => {
                try {
                    const collection = await client.db(dbLookupData.db).collection(dbLookupData.collection);

                    // fetch single document from collection
                    return await collection.findOne(query);
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async fetchAll <T> (query: FilterQuery<T>, dbLookupData : DbLookupData): Promise<T[]> {
        try {
            // open connection
            return await this.openConnection(dbLookupData.uri).then(async client => {
                try {
                    const collection = await client.db(dbLookupData.db).collection(dbLookupData.collection);

                    // fetch documents from collection
                    return await collection.find(query).toArray();
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async insertOne <T> (doc : T, dbLookupData : DbLookupData) : Promise<OperationFeedback> {
        try {
            // open connection
            return await this.openConnection(dbLookupData.uri).then(async client => {
                try {
                    const collection = await client.db(dbLookupData.db).collection(dbLookupData.collection);

                    // insert doc in collection
                    await collection.insertOne(doc);

                    return {success : true, message : "Insertion Successful", data : doc}
                    
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async updateOne <T> (filter: FilterQuery<T>, update: UpdateQuery<T>, dbLookupData : DbLookupData): Promise<OperationFeedback> {
        try {
            // open connection
            return await this.openConnection(dbLookupData.uri).then(async client => {
                try {
                    const collection = client.db(dbLookupData.db).collection(dbLookupData.collection);
                                
                    // update document in collection
                    await collection.updateOne(filter, update)
                    return {success: true, message: "Document Updated Successfully"};

                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async deleteOne <T> (query: FilterQuery<T>, dbLookupData : DbLookupData) : Promise<OperationFeedback> {
        try {
            // open connection
            return await this.openConnection(dbLookupData.uri).then(async client => {
                try {
                    const collection = await client.db(dbLookupData.db).collection(dbLookupData.collection);

                    // delete document in collection
                    await collection.deleteOne(query);

                    return {success : true, message : "Deletion Successful"}
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

















    // Auth Token CRUD
    async insertAuthToken(authKeyObject: IAuthKey) {
        try {
            await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.authTokens);

                    await collection.insertOne(authKeyObject);
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    async fetchAuthToken(query: FilterQuery<IAuthKey>): Promise<IAuthKey> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.authTokens);
                                
                    // fetch authKey in collection
                    return await collection.findOne(query);
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async updateAuthToken(tokenQuery: FilterQuery<IAuthKey>, update: UpdateQuery<IAuthKey>) {
        try {
            await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.authTokens);

                    await collection.updateMany(tokenQuery, update);
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    async deleteToken(query: FilterQuery<IAuthKey>) {
        try {
            await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.authTokens);

                    await collection.deleteOne(query);
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    // Transactions CRUD
    async insertInSuccessfulTransactions(payment: PaymentDto) {
        try {
            await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.successfulTransactions);

                    await collection.insertOne(payment);
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    async fetchAllSuccessfulTransactions(): Promise<PaymentDto[]> {
        try {
            return await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.successfulTransactions);
                    return await collection.find({}).toArray();
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    async fetchSuccessfulTransactions(contributor_id: string): Promise<PaymentDto[]> {
        try {
            return await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.successfulTransactions);
                    return await collection.find({$or: [{from: contributor_id}, {to: contributor_id}]}).toArray();
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    async fetchSuccessfulTransaction(payment_id: string): Promise<PaymentDto> {
        try {
            return await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.successfulTransactions);
                    return await collection.findOne({_id: payment_id});
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    async deleteFromSuccessfulTransactions(id: string) {
        try {
            await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.successfulTransactions);

                    await collection.deleteOne({_id: id});
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }
    async insertInFailedTransactions(payment: PaymentDto) {
        try {
            await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.failedTransactions);

                    await collection.insertOne(payment);
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    async deleteFromFailedTransactions(id: string) {
        try {
            await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.failedTransactions);

                    await collection.deleteOne({_id: id});
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }
    async insertInOngoingTransactions(payment: PaymentDto) {
        try {
            await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.ongoingTransactions);

                    await collection.insertOne(payment);
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }
    async deleteFromOngoingTransactions(id: string) {
        try {
            await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.ongoingTransactions);

                    await collection.deleteOne({_id: id});
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    // Account CRUD
    async updateAdminAccount(payload: {_id: string, account: AdminAccountModel}) {
        try {
            await this.openConnection().then( async client => {
                try {
                    await this.useSession(client).then( async session => {
                        try {
                            let trxResult = await session.withTransaction(async () => {
                                                const collection = client.db(this.dbName).collection(this.collections.admins);
                                                await collection.updateOne({_id: payload._id}, {$set: {"account.balance": payload.account.balance}});                          
                                            }, {
                                                readPreference: 'primary',
                                                readConcern: { level: 'local' },
                                                writeConcern: { w: 'majority' }
                                            });
                        } catch (e) {
                            console.error(e)
                        } finally {
                            await this.endSession(session);
                        }
                    })
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    async updateContributorAccount(payload: {_id: string, account: AccountModel}) {
        try {
            await this.openConnection().then( async client => {
                try {
                    await this.useSession(client).then( async session => {
                        try {
                            let trxResult = await session.withTransaction(async () => {
                                                const collection = client.db(this.dbName).collection(this.collections.contributors);
                                                await collection.updateOne({_id: payload._id}, {$set: {"account.balance": payload.account.balance}});                       
                                            }, {
                                                readPreference: 'primary',
                                                readConcern: { level: 'local' },
                                                writeConcern: { w: 'majority' }
                                            });
                        } catch (e) {
                            console.error(e)
                        } finally {
                            await this.endSession(session);
                        }
                    })
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    // Activities CRUD

    async registerContributorAction(payload: IRegisterActionRequest) {
        try {
            await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.contributors);

                    await collection.updateOne({_id: payload._id }, {$push: {"activities.actions": payload.newAction}})
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    async registerAdminAction(payload: IRegisterActionRequest) {
        try {
            await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.admins);

                    await collection.updateOne({_id: payload._id }, {$push: {"activities.actions": payload.newAction}})
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    // Contributors CRUD
    async fetchContributor(query: FilterQuery<ContributorDto>): Promise<ContributorDto> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.contributors);
                                
                    // fetch contributor in collection
                    return await collection.findOne(query);
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async fetchContributors(query: FilterQuery<ContributorDto>): Promise<ContributorDto[]> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.contributors);
                                
                    // fetch contributors in collection
                    return await collection.find(query).toArray();
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async createContributor(signupRequestId: string, contributor: ContributorDto) {
        try {
            await this.openConnection().then(async client => {
                try {
                    await this.useSession(client).then(async session => {
                        try {
                            
                            let trx = await session.withTransaction(async () => {
                                const contributorsCollection = client.db(this.dbName).collection(this.collections.contributors);
                                const signupsCollections = client.db(this.dbName).collection(this.collections.signupRequests);

                                // insert contributor
                                await contributorsCollection.insertOne(contributor);
                                // remove signupRequest
                                await signupsCollections.deleteOne({_id: signupRequestId});
                                // register actions
                                // register account registration action
                                let action: ActionModel = {
                                    description: 'Account registration',
                                    date: contributor.activities.regDate,
                                    type: {
                                        is: "AccountRegistration"
                                    }
                                }

                                // register registration action
                                let actionTwo = {
                                    description: 'Account registration approval',
                                    date: new Date().toISOString(),
                                    type: {
                                        is: "AccountApproval"
                                    }
                                }
                                await contributorsCollection.updateOne({_id: contributor._id}, {$push: {"activities.actions": action}})
                                await contributorsCollection.updateOne({_id: contributor._id}, {$push: {"activities.actions": actionTwo}})
                                
                                
                            }, {
                                readPreference: 'primary',
                                readConcern: { level: 'local' },
                                writeConcern: { w: 'majority' }
                            })

                        } catch (e) {
                            console.error(e)
                        } finally {
                            this.endSession(session)
                        }
                    });
                } catch(e) {
                    console.error(e)
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    async deleteContributor(query: FilterQuery<any>) {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.contributors);
                                
                    // delete contributor
                    return await collection.deleteOne(query);
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    // Register Signup Request CRUD
    async insertSignupRequest(req: SignupRequestDto) {
        try {
            // open connection
            await this.openConnection().then(async client => {
                try {
                    const signupsCollection = await client.db(this.dbName).collection(this.collections.signupRequests);

                    // insert req in collection
                    await signupsCollection.insertOne(req);
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }


    async replaceSignupRequest(query: FilterQuery<SignupRequestDto>, req: SignupRequestDto): Promise<OperationFeedback> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const signupsCollection = await client.db(this.dbName).collection(this.collections.signupRequests);

                    // insert req in collection
                    await signupsCollection.replaceOne(query, req);
                    return {success: true, message: "Signup Request Updated"}
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async fetchSignupRequest(query: FilterQuery<SignupRequestDto>): Promise<SignupRequestDto> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const signupsCollection = await client.db(this.dbName).collection(this.collections.signupRequests);

                    // fetch req in collection
                    return await signupsCollection.findOne(query);
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async fetchSignupRequests(query: FilterQuery<SignupRequestDto>): Promise<SignupRequestDto[]> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const signupsCollection = await client.db(this.dbName).collection(this.collections.signupRequests);

                    // fetch req in collection
                    return await signupsCollection.find(query).toArray();
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async deleteSignupRequest(id: string) {
        try {
            // open connection
            await this.openConnection().then(async client => {
                try {
                    const signupsCollection = await client.db(this.dbName).collection(this.collections.signupRequests);

                    // insert req in collection
                    await signupsCollection.deleteOne({_id: id});

                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    // Deposit Request CRUD
    async insertDepositRequest(req: DepositRequestDto) {
        try {
            // open connection
            await this.openConnection().then(async client => {
                try {
                    const depositsCollection = await client.db(this.dbName).collection(this.collections.depositRequests);

                    // insert req in collection
                    await depositsCollection.insertOne(req);
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async updateDepositRequest(filter: FilterQuery<DepositRequestDto>, update: UpdateQuery<any>): Promise<OperationFeedback> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.depositRequests);
                                
                    // fetch contributor in collection and return his privilege
                    await collection.updateOne(filter, update)
                    return {success: true, message: "Request Updated Successfully"};

                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async deleteDepositRequest(query: FilterQuery<DepositRequestDto>) {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const depositsCollection = await client.db(this.dbName).collection(this.collections.depositRequests);

                    // fetch announcements in collection
                    await depositsCollection.deleteOne(query);
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async fetchDepositRequest(query: FilterQuery<DepositRequestDto>): Promise<DepositRequestDto> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const depositsCollection = await client.db(this.dbName).collection(this.collections.depositRequests);

                    // fetch announcements in collection
                    return await depositsCollection.findOne(query);
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async fetchDepositRequests(query: FilterQuery<DepositRequestDto>): Promise<DepositRequestDto[]> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const depositsCollection = await client.db(this.dbName).collection(this.collections.depositRequests);

                    // fetch announcements in collection
                    return await depositsCollection.find(query).toArray();
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    // Withdrawal Request CRUD
    async insertWithdrawalRequest(req: WithdrawalRequestDto) {
        try {
            // open connection
            await this.openConnection().then(async client => {
                try {
                    const withdrawalsCollection = await client.db(this.dbName).collection(this.collections.withdrawalRequests);
    
                    // insert req in collection
                    await withdrawalsCollection.insertOne(req);
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async updateWithdrawalRequest(filter: FilterQuery<WithdrawalRequestDto>, update: UpdateQuery<any>): Promise<OperationFeedback> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.withdrawalRequests);
                                
                    // fetch contributor in collection and return his privilege
                    await collection.updateOne(filter, update)
                    return {success: true, message: "Request Updated Successfully"};

                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async fetchWithdrawalRequest(query: FilterQuery<WithdrawalRequestDto>): Promise<WithdrawalRequestDto> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const withdrawalsCollection = await client.db(this.dbName).collection(this.collections.withdrawalRequests);

                    // fetch announcements in collection
                    return await withdrawalsCollection.findOne(query);
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async deleteWithdrawalRequest(query: FilterQuery<WithdrawalRequestDto>) {
        try {
            // open connection
            await this.openConnection().then(async client => {
                try {
                    const withdrawalsCollection = await client.db(this.dbName).collection(this.collections.withdrawalRequests);

                    // delete req in collection
                    await withdrawalsCollection.deleteOne(query);

                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async fetchWithdrawalRequests(query: FilterQuery<WithdrawalRequestDto>): Promise<WithdrawalRequestDto[]> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const withdrawalsCollection = await client.db(this.dbName).collection(this.collections.withdrawalRequests);

                    // fetch announcements in collection
                    return await withdrawalsCollection.find(query).toArray();
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    // Announcements CRUD
    async fetchAnnouncements(query: FilterQuery<AnnouncementsDto>): Promise<AnnouncementsDto[]> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const announcementsCollection = await client.db(this.dbName).collection(this.collections.announcements);

                    // fetch announcements in collection
                    return await announcementsCollection.find(query).toArray();
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async fetchAnnouncement(query: FilterQuery<AnnouncementsDto>): Promise<AnnouncementsDto> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const announcementsCollection = await client.db(this.dbName).collection(this.collections.announcements);

                    // fetch announcements in collection
                    return await announcementsCollection.findOne(query);
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async deleteAnnouncement(query: FilterQuery<AnnouncementsDto>): Promise<OperationFeedback> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const announcementsCollection = await client.db(this.dbName).collection(this.collections.announcements);

                    // fetch announcements in collection
                    await announcementsCollection.deleteOne(query);
                    return {success: true, message: "Annnouncement Deleted Successfully"};
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async replaceAnnouncement(query: FilterQuery<AnnouncementsDto>, new_announcement: AnnouncementsDto): Promise<OperationFeedback> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const announcementsCollection = await client.db(this.dbName).collection(this.collections.announcements);

                    // fetch announcements in collection
                    await announcementsCollection.replaceOne(query, new_announcement);
                    return {success: true, message: "Update Successful"}
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async insertAnnouncement(announcement: AnnouncementsDto) {
        try {
            // open connection
            await this.openConnection().then(async client => {
                try {
                    const announcementsCollection = await client.db(this.dbName).collection(this.collections.announcements);
    
                    // insert req in collection
                    await announcementsCollection.insertOne(announcement);
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    // Privilege CRUD
    async fetchContributorPrivilege(contributor_id: string): Promise<PrivilegeModel> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.contributors);
                                
                    // fetch contributor in collection and return his privilege
                    let c: ContributorDto = await collection.findOne({_id: contributor_id});
                    return c.privilege;

                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async updateContributor(filter: FilterQuery<ContributorDto>, update: UpdateQuery<any>): Promise<OperationFeedback> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.contributors);
                                
                    // fetch contributor in collection and return his privilege
                    await collection.updateOne(filter, update)
                    return {success: true, message: "Privilege Updated Successfully"};

                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }


    // Identity CRUD
    async fetchContributorIdentity(contributor_id: string): Promise<IdentityModel> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.contributors);
                                
                    // fetch contributor in collection and return his privilege
                    let c: ContributorDto = await collection.findOne({_id: contributor_id});
                    return c.identity;

                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }


    // Subordinates CRUD and Assigning
    async assignSubordinates(new_overseer_id: string, subordinates_id_list: string[]): Promise<OperationFeedback> {
        let response: OperationFeedback;
        try {
            await this.openConnection().then( async client => {
                try {
                    await this.useSession(client).then( async session => {
                        try {
                            let trxResult = await session.withTransaction(async () => {
                                                const collection = client.db(this.dbName).collection(this.collections.contributors);
                                                for(let id of subordinates_id_list) {
                                                    await collection.updateOne({_id: id}, {$set: {"basicInformation.overseerId": new_overseer_id}});
                                                }
                                                response = {success: true, message: "Subordinates Overseer Updated Successfully"};
                                            }, {
                                                readPreference: 'primary',
                                                readConcern: { level: 'local' },
                                                writeConcern: { w: 'majority' }
                                            });
                        } catch (e) {
                            console.error(e)
                        } finally {
                            await this.endSession(session);
                        }
                    })
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
            return response;
        } catch(e) {
            console.error(e);
        }
    }

    // Referrals
    async updateContributorReferral(filter: FilterQuery<ContributorDto>, update: UpdateQuery<any>): Promise<OperationFeedback> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.contributors);
                                
                    // fetch contributor in collection and return his privilege
                    await collection.updateOne(filter, update)
                    return {success: true, message: "Privilege Updated Successfully"};

                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    // update Payment Ticks
    async updateContributorPaymentTicks(filter: FilterQuery<ContributorDto>, update: UpdateQuery<any>): Promise<OperationFeedback> {
        try {
            // open connection
            return await this.openConnection().then(async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.contributors);
                                
                    // fetch contributor in collection and return his privilege
                    await collection.updateOne(filter, update)
                    return {success: true, message: "Payment Ticks Updated Successfully"};

                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    // admin CRUD
    async insertAdmin(adminObject: AdminDto) {
        try {
            await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.admins);

                    await collection.insertOne(adminObject);
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    async fetchAdmin(query: FilterQuery<AdminDto>): Promise<AdminDto> {
        try {
            return await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.admins);

                    return await collection.findOne(query);
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    async fetchAdmins(query: FilterQuery<AdminDto>): Promise<AdminDto[]> {
        try {
            return await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.admins);

                    return await collection.find(query).toArray();
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    async updateAdmin(query: FilterQuery<AdminDto>, update: UpdateQuery<AdminDto>): Promise<OperationFeedback> {
        try {
            return await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.admins);

                    await collection.updateOne(query, update);
                    return {success: true, message: "Admin updated successfully!"}
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    // company data
    async insertNewCompanyData(companyObject: CompanyDto) {
        try {
            await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.company);

                    await collection.insertOne(companyObject);
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    async fetchCompanyData(query: FilterQuery<CompanyDto>): Promise<CompanyDto> {
        try {
            return await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.company);

                    return await collection.findOne(query);
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }


    async updateCompanyData(query: FilterQuery<CompanyDto>, update: UpdateQuery<CompanyDto>): Promise<OperationFeedback> {
        try {
            return await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.company);

                    await collection.updateOne(query, update);
                    return {success: true, message: "Company information updated successfully!"}
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    // chats CRUD
    async fetchChatsContainer(query: FilterQuery<ChatsContainerDto>): Promise<ChatsContainerDto> {
        try {
            return await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.chats);

                    return await collection.findOne(query);
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    // chats CRUD
    async fetchChatsContainers(query: FilterQuery<ChatsContainerDto>): Promise<ChatsContainerDto[]> {
        try {
            return await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.chats);

                    return await collection.find(query).toArray();
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    async updateChatsContainer(query: FilterQuery<ChatsContainerDto>, update: UpdateQuery<ChatsContainerDto>): Promise<OperationFeedback> {
        try {
            return await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.chats);

                    await collection.updateOne(query, update);
                    return {success: true, message: "Chat Updated Successfully"};
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    async insertChatsContainer(chatsContainer: ChatsContainerDto): Promise<OperationFeedback> {
        try {
            return await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.chats);

                    await collection.insertOne(chatsContainer);

                    return {success: true, message: "Chat Container Inserted Successfully"};
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            });
        } catch(e) {
            console.error(e);
        }
    }

    // SMS CRUD
    async insertSMSProforma(smsProforma: SMSProforma) {
        try {
            await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.smsProformas);

                    await collection.insertOne(smsProforma);
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    async fetchSMSProforma(query: FilterQuery<SMSProforma>): Promise<SMSProforma> {
        try {
            return await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.smsProformas);

                    return await collection.findOne(query);
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    async fetchSMSProformas(query: FilterQuery<SMSProforma>): Promise<SMSProforma[]> {
        try {
            return await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.smsProformas);

                    return await collection.find(query).toArray();
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    async updateSMSProforma(query: FilterQuery<SMSProforma>, update: UpdateQuery<SMSProforma>): Promise<OperationFeedback> {
        try {
            return await this.openConnection().then( async client => {
                try {
                    const collection = client.db(this.dbName).collection(this.collections.smsProformas);

                    await collection.updateOne(query, update);
                    return {success: true, message: "SMS Proforma Updated Successfully"};
                } catch(e) {
                    console.error(e);
                } finally {
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e);
        }
    }

    // Utils

    private async openConnection(uri ?: string): Promise<MongoClient> {
        try {
            const client = new MongoClient(uri || this.uri, {
                compression: {compressors: [`zlib`]},
                useNewUrlParser: true, 
                useUnifiedTopology: true
            });
            return await client.connect();
        } catch(e) {
            console.error(e);
        }
    }

    private async closeConnection(client: MongoClient) {
        try {
            await client.close();
        } catch(e) {
            console.error(e);
        }
 
    }

    private async useSession(client: MongoClient): Promise<ClientSession> {
        let session = await client.startSession()
        return session;
    }

    private async endSession(session: ClientSession) {
        try {
            session.endSession();
        } catch(e) {
            console.error(e);
        }
    }
}
