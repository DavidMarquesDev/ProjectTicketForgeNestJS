import { Strategy } from 'passport-jwt';
type JwtPayload = {
    sub: number;
    email: string;
    role: string;
};
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtPayload): {
        id: number;
        email: string;
        role: string;
    };
}
export {};
