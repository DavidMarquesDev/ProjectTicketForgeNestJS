"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const typeorm_1 = require("@nestjs/typeorm");
const auth_controller_1 = require("./auth.controller");
const login_handler_1 = require("./commands/login/login.handler");
const logout_handler_1 = require("./commands/logout/logout.handler");
const user_entity_1 = require("./entities/user.entity");
const get_me_handler_1 = require("./queries/get-me/get-me.handler");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const commandHandlers = [login_handler_1.LoginHandler, logout_handler_1.LogoutHandler];
const queryHandlers = [get_me_handler_1.GetMeHandler];
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET ?? 'dev-secret',
                signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
            }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [jwt_strategy_1.JwtStrategy, ...commandHandlers, ...queryHandlers],
        exports: [jwt_1.JwtModule, typeorm_1.TypeOrmModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map