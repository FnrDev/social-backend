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
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const zod_validation_error_1 = require("zod-validation-error");
function validate(schema) {
    return function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                zod_1.z.object(schema).parse({ body: req.body, params: req.params, query: req.query });
                return next();
            }
            catch (err) {
                return res.status(500).json({ error: (0, zod_validation_error_1.fromZodError)(err, { issueSeparator: " &" }).message });
            }
        });
    };
}
exports.default = validate;
