"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivitiesModule = void 0;
const common_1 = require("@nestjs/common");
const shared_module_1 = require("../modules/shared/shared.module");
const activities_controller_1 = require("./activities/activities.controller");
let ActivitiesModule = class ActivitiesModule {
};
ActivitiesModule = __decorate([
    common_1.Module({
        controllers: [activities_controller_1.ActivitiesController],
        imports: [shared_module_1.SharedModule]
    })
], ActivitiesModule);
exports.ActivitiesModule = ActivitiesModule;
//# sourceMappingURL=activities.module.js.map