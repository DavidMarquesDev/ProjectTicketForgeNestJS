export declare enum UserRole {
    ADMIN = "admin",
    SUPPORT = "support",
    USER = "user"
}
export declare class User {
    id: number;
    email: string;
    passwordHash: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
