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
const logger_1 = __importDefault(require("./logger"));
const connect_1 = require("./db/connect");
const memory_1 = require("./db/memory");
function default_1(app) {
    app.get('/', (req, res) => {
        try {
            res.send(memory_1.welcomeMessage);
        }
        catch (error) {
            return res.status(500).send(error);
        }
    });
    app.get('/manga', (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            res.send(memory_1.mangaList);
        }
        catch (error) {
            return res.status(500).send(error);
        }
    }));
    app.get('/schedule', (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            res.send(memory_1.chapterSchedule);
        }
        catch (error) {
            return res.status(500).send(error);
        }
    }));
    app.get('/manga/:mangaID', (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { mangaID } = req.params;
            (0, connect_1.getOneManga)(mangaID)
                .then(response => {
                return res.send(response);
            })
                .catch(error => logger_1.default.info(error));
        }
        catch (error) {
            return res.status(500).send(error);
        }
    }));
}
exports.default = default_1;
