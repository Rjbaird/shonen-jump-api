"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("./logger"));
const routes_1 = __importDefault(require("./routes"));
// Basic Server Setup
const PORT = process.env.PORT || 8000;
const app = (0, express_1.default)();
const connect_1 = require("./db/connect");
const utils_1 = require("./utils");
const middleware_1 = require("./middleware");
// Documentation Tools
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
// Install Global Middleware
app.use([
    express_1.default.urlencoded({ extended: false }),
    express_1.default.json(),
    (0, middleware_1.helmet)(),
    (0, middleware_1.morgan)('dev'),
    (0, middleware_1.cors)(),
    middleware_1.limiter,
    (0, middleware_1.compression)(),
]);
// Swagger Docs Automation
const swagOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Shonen Jump API',
            version: '1.1.0',
            description: 'An API showing data about English releases from Weekly Shonen Jump',
        },
        contact: {
            name: 'Ryan Baird',
            url: 'https://ryanbaird.com/',
            email: 'rjbaird09@gmail.com',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
    },
    apis: ['./src/*.ts'],
};
const docSpecs = (0, swagger_jsdoc_1.default)(swagOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(docSpecs));
// Update memory on server start
(0, connect_1.getAllManga)();
(0, connect_1.getUpcomingReleases)((0, utils_1.currentUnixDate)());
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`Server running at http://localhost:${PORT}`);
    (0, routes_1.default)(app);
}));
