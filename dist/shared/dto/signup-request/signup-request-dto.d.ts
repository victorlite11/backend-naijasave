export declare class SignupRequestDto {
    _id?: string;
    phoneNumber: string;
    email: string;
    username?: string;
    password: string;
    name: string;
    regDate: string;
    age: number;
    gender: "male" | "female";
    dateOfBirth: string;
    nextOfKin: string;
    country: string;
    state: string;
    localGovernment: string;
    address: string;
    referrer?: string;
    overseerId?: string;
    accountType: 'investor' | 'contributor';
    dailySavings: number;
}
