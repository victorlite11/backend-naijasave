"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubordinatesModule = void 0;
const common_1 = require("@nestjs/common");
const shared_module_1 = require("../modules/shared/shared.module");
const subordinates_controller_1 = require("./subordinates/subordinates.controller");
let SubordinatesModule = class SubordinatesModule {
};
SubordinatesModule = __decorate([
    common_1.Module({
        controllers: [subordinates_controller_1.SubordinatesController],
        imports: [shared_module_1.SharedModule]
    })
], SubordinatesModule);
exports.SubordinatesModule = SubordinatesModule;
//# sourceMappingURL=subordinates.module.js.map