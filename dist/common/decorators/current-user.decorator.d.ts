export type AuthenticatedUser = {
    id: number;
    email: string;
    role: string;
};
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
