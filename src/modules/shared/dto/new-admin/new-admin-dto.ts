import { AdminIdentityModel, AdminPrivilegeModel } from "../admin/admin-dto";

export class NewAdminDto {
    _id?: string;
    name: string;
    phoneNumber: string;
    email?: string;
    password: string;
    dateOfBirth: string;
    country: string;
    state: string;
    localGovernment: string;
    address: string;
    gender: "male" | "female" | "other";
    overseer_id?: string;
    starting_balance?: number;
    identity: "head" | "super" | "sub";
}
