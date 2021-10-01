"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.run = void 0;
const fs_1 = __importDefault(require("fs"));
const core = __importStar(require("@actions/core"));
const yaml_cfn_1 = require("yaml-cfn");
const jsonpath_1 = __importDefault(require("jsonpath"));
const VarParser_1 = require("./VarParser");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // `file` input is required, and the file is required to exist
            const filePath = core.getInput("file");
            if (!fs_1.default.existsSync(filePath)) {
                throw new Error(`Could not find file with path: ${filePath}`);
            }
            // `env-prop-jsonpath` input is required
            const jsonPath = core.getInput("env-prop-jsonpath");
            if (!jsonPath) {
                throw new Error("The env-prop-jsonpath value must be provided.");
            }
            // read and parse the yaml file
            const file = yield fs_1.default.promises.readFile(filePath);
            const parsedYaml = (0, yaml_cfn_1.yamlParse)(file.toString("utf8"));
            const parsedVars = VarParser_1.VarParser.parseVars(core.getMultilineInput("vars"));
            // replace the specified node path with the environment variables descriptor
            jsonpath_1.default.apply(parsedYaml, jsonPath, () => parsedVars || []);
            // save the file
            yield fs_1.default.promises.writeFile(filePath, (0, yaml_cfn_1.yamlDump)(parsedYaml));
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
exports.run = run;
;
run();
