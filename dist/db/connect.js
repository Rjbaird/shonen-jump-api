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
exports.disconnect = exports.connect = void 0;
const logger_1 = __importDefault(require("../logger"));
const mongoose_1 = __importDefault(require("mongoose"));
// Connect to MongoDB
const connect = () => {
    const url = process.env.DB_URI;
    mongoose_1.default.connect(url);
    mongoose_1.default.connection.once('open', () => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.info('Connected to database');
    }));
    mongoose_1.default.connection.on('error', err => {
        logger_1.default.error('Error connecting to database  ', err);
    });
};
exports.connect = connect;
const disconnect = () => {
    if (!mongoose_1.default.connection) {
        return;
    }
    mongoose_1.default.disconnect();
    mongoose_1.default.connection.once('close', () => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Diconnected  to database');
    }));
};
exports.disconnect = disconnect;
