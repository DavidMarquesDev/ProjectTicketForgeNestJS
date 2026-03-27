"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const logout_command_1 = require("./logout.command");
let LogoutHandler = class LogoutHandler {
    async execute() {
        return { success: true };
    }
};
exports.LogoutHandler = LogoutHandler;
exports.LogoutHandler = LogoutHandler = __decorate([
    (0, cqrs_1.CommandHandler)(logout_command_1.LogoutCommand)
], LogoutHandler);
//# sourceMappingURL=logout.handler.js.map