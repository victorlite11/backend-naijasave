import { ISimpleIdGenerationPayload } from "src/shared/interface/shared-interfaces";
export declare class IdGenerator {
    private static smallAlphabets;
    private static bigAlphabets;
    simpleId(payload: ISimpleIdGenerationPayload): string;
    static generateAuthToken(maxLength?: number): string;
    static generateKey(maxLength: number): string;
    static generateAdminKey(maxLength: number): string;
    static getRand(max: number): number;
    static generateReferralCode(max: number): number;
}
