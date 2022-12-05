"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const corsOptions = {
        origin: ["http://localhost:4200", "http://localhost:5555", "https://naija-save.com.ng", "https://naijasave-a.vercel.app", "https://naijasave-a-d8ou5aliq.vercel.app", "https://naijasave-c.vercel.app", "https://naijasave-c-qzjv9cpqt.vercel.app"],
        "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        "preflightContinue": false,
        "optionsSuccessStatus": 204
    };
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: corsOptions });
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map