import { AdminAccountModel } from 'src/shared/dto/admin/admin-dto';
import { AccountModel } from 'src/shared/dto/contributor/contributor-dto';
import { EntityIdentity, IFetchEntity, IRegisterActionRequest } from 'src/shared/interface/shared-interfaces';
import { DbMediatorService } from '../../db-mediator/db-mediator.service';
export declare class EntitiesMediatorService {
    private dbMediatorService;
    constructor(dbMediatorService: DbMediatorService);
    exists(id: string): Promise<Boolean>;
    isContributor(id: string): Promise<boolean>;
    isAdmin(id: string): Promise<boolean>;
    fetchEntity(id: string): Promise<IFetchEntity>;
    fetchEntityUsingPhoneNumber(phoneNumber: string): Promise<IFetchEntity>;
    updateEntityAccount(payload: {
        _id: string;
        account: AdminAccountModel | AccountModel;
    }, identity?: EntityIdentity): Promise<void>;
    registerAction(payload: IRegisterActionRequest): Promise<void>;
}
