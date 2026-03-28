export class LoginCommand {
    constructor(
        public readonly cpf: string,
        public readonly password: string,
    ) {}
}
