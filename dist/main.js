"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const redoc_express_1 = require("redoc-express");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('TicketForge API')
        .setDescription('API de tickets com arquitetura CQRS em NestJS')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs/api', app, document);
    app.use('/docs/redoc', (0, redoc_express_1.default)({
        title: 'TicketForge API Docs',
        specUrl: '/docs/api-json',
    }));
    await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
void bootstrap();
//# sourceMappingURL=main.js.map