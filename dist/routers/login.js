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
exports.LoginRouter = void 0;
const express_1 = require("express");
const node_crypto_1 = require("node:crypto");
const validate_1 = __importDefault(require("../middlewares/validate"));
const login_1 = require("../validations/login");
exports.LoginRouter = (0, express_1.Router)();
exports.LoginRouter.post("/", (0, validate_1.default)({ body: login_1.LoginSchema }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // get the email, password from request body
    const { email, password } = req.body;
    // hash the password to store it latter in database
    const hasedPassword = (0, node_crypto_1.createHash)("sha256").update(password).digest("hex");
    // create a session token
    const token = (0, node_crypto_1.randomBytes)(32).toString("hex");
    // store the email, hasedPassword, token in database
    // return the token to frontend, to store it in local storage
    return res.json({ token });
}));
