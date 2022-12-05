"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdGenerator = void 0;
const shared_interfaces_1 = require("../../interface/shared-interfaces");
class IdGenerator {
    simpleId(payload) {
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
    static generateAuthToken(maxLength = 25) {
        let token = "";
        for (let i = 0; i <= maxLength; i++) {
            let rand = this.getRand(26);
            let determinant = this.getRand(60);
            if (determinant % 2 == 0 && determinant % 3 !== 0) {
                token += IdGenerator.smallAlphabets[rand];
            }
            if (determinant % 2 !== 0 && determinant % 3 == 0) {
                token += IdGenerator.bigAlphabets[rand];
            }
            if (determinant % 2 == 0 && determinant % 3 == 0) {
                token += String(rand);
            }
        }
        return token;
    }
    static generateKey(maxLength) {
        return IdGenerator.generateAuthToken(maxLength);
    }
    static generateAdminKey(maxLength) {
        return "admin-" + IdGenerator.generateAuthToken(maxLength);
    }
    static getRand(max) {
        return Math.floor(Math.random() * max);
    }
    static generateReferralCode(max) {
        return this.getRand(max);
    }
}
exports.IdGenerator = IdGenerator;
IdGenerator.smallAlphabets = 'abcdefghijklmnopqrstuvwxyz'.split('');
IdGenerator.bigAlphabets = 'abcdefghijklmnopqrstuvwxyz'.toLocaleUpperCase().split('');
//# sourceMappingURL=id-generator.js.map