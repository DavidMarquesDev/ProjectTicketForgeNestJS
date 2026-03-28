export class RegisterCommand {
    constructor(
        public readonly name: string,
        public readonly cpf: string,
        public readonly email: string,
        public readonly password: string,
    ) {}
}
