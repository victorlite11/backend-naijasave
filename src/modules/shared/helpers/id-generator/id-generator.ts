import { ISimpleIdGenerationPayload } from "src/modules/shared/interface/shared-interfaces";

export class IdGenerator {
    private static smallAlphabets = 'abcdefghijklmnopqrstuvwxyz'.split('');
    private static bigAlphabets = 'abcdefghijklmnopqrstuvwxyz'.toLocaleUpperCase().split('');

    simpleId(payload: ISimpleIdGenerationPayload): string {
        let id = "";
        id += String(Math.floor(Math.random() * 99));
        id += "-";
        id += String(Math.floor(Math.random() * 9999));
        id += "-";
        id += String(Math.floor(Math.random() * 999));
        id += "-";
        id += String(Math.floor(Math.random() * 99999));
        id += "-";
        id += String(Math.floor(Math.random() * 999));
        return id;
    }

    static generateAuthToken(maxLength: number = 25): string {
        
        let token = "";

        for(let i = 0; i <= maxLength; i++) {
            let rand = this.getRand(26);
            let determinant = this.getRand(60);
            
            if(determinant % 2 == 0 && determinant % 3 !== 0) {
                token += IdGenerator.smallAlphabets[rand]
            } 
            if(determinant % 2 !== 0 && determinant % 3 == 0) {
                token += IdGenerator.bigAlphabets[rand]
            }
            if(determinant % 2 == 0 && determinant % 3 == 0) {
                token += String(rand)
            }
        }

        return token;
    }

    static generateKey(maxLength: number): string {
        return IdGenerator.generateAuthToken(maxLength);
    }

    static generateAdminKey(maxLength: number): string {
        return "admin-" + IdGenerator.generateAuthToken(maxLength);
    }

    static getRand(max: number): number {
        return Math.floor(Math.random() * max)
    }

    static generateReferralCode(max: number): number {
        return this.getRand(max);
    }
}
