export declare enum UserRole {
    ADMIN = "admin",
    SUPPORT = "support",
    USER = "user"
}
export declare class User {
    id: number;
    name: string;
    cpf: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
