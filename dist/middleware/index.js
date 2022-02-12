"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.limiter = exports.compression = exports.cors = exports.morgan = exports.helmet = void 0;
// ===== Global Middleware ===== //
const helmet_1 = __importDefault(require("helmet"));
exports.helmet = helmet_1.default;
const morgan_1 = __importDefault(require("morgan"));
exports.morgan = morgan_1.default;
const cors_1 = __importDefault(require("cors"));
exports.cors = cors_1.default;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const compression_1 = __importDefault(require("compression"));
exports.compression = compression_1.default;
// ===== Middleware Config ===== //
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many accounts created from this IP, please try again after 15 minutes',
});
exports.limiter = limiter;
