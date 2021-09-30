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
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const readFileAsync = util_1.default.promisify(fs_1.default.readFile);
const writeFileAsync = util_1.default.promisify(fs_1.default.writeFile);
const core = __importStar(require("@actions/core"));
const yaml_cfn_1 = require("yaml-cfn");
const jsonpath_1 = __importDefault(require("jsonpath"));
const placeholder = "${vars-placeholder}";
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
            const file = yield readFileAsync(filePath);
            const parsedYaml = yaml_cfn_1.yamlParse(file.toString("utf8"));
            // get the vars
            const vars = getVars();
            core.startGroup("Parsed vars");
            core.info(JSON.stringify(vars));
            core.endGroup();
            // replace the specified node path with the environment variables descriptor
            jsonpath_1.default.apply(parsedYaml, jsonPath, () => vars);
            // save the file
            yield writeFileAsync(filePath, yaml_cfn_1.yamlDump(parsedYaml));
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
;
function parseVarLine2(line) {
    var _a;
    line = line === null || line === void 0 ? void 0 : line.trim();
    if (!line) {
        return undefined;
    }
    const { groups: [name, value] } = ((_a = /^(?<name>.+)\s*\:\s*(?<value>.*)$/g.exec(line)) === null || _a === void 0 ? void 0 : _a.groups) || {};
    // line has a colon, but no value. set value to undefined
    if (!value) {
        return { Name: name };
    }
    // line has a colon and a value. value may be wrapped in quotes of some sort
    else {
        const valNoWrappingSingleOrDoubleQuotes = trimPairedWrap(trimPairedWrap(value), "'");
        return { Name: name, Value: valNoWrappingSingleOrDoubleQuotes };
    }
}
function trimPairedWrap(str, sep = "\"") {
    const trimWrapRegex = new RegExp(`${sep}([^${sep}]+(?=${sep}))${sep}`, "g");
    return str.replace(trimWrapRegex, "$1");
}
/**
 * Possibilities:
 * // this is a comment
 * # this is a comment
 *
 * # will create MYVAR1 variable entry and set its value to secrets[MYVAR1]
 * MYVAR1
 * # will create MYVAR2 variable entry and set its value to undefined
 * MYVAR2:
 * # will create MYVAR3 variable entry and set its value to 'some value'
 * MYVAR3: 'some value'
 * @returns a parsed environment variable info object
 */
// function parseVarLine(line?: string): IEnvVarInfo | undefined {
//     // if the line is empty or starts # or //, it is ignored
//     line = line?.trim();
//     if (!line || line.startsWith("#") || line.startsWith("//")) {
//         return undefined;
//     }
//     const colonIndex = line.indexOf(":");
//     // if the colon is first thing on the line, throw an error since we need a variable name
//     if (colonIndex === 0) {
//         throw new Error("A line containing a colon must provide a variable name");
//     }
//     // there is no colon on the line, get the value from Github Secrets
//     if (colonIndex === -1) {
//         //todo
//     }
// }
function getVars() {
    const output = [];
    const vars = core.getMultilineInput("vars");
    return vars.map(vl => parseVarLine2(vl))
        .filter(v => !!v)
        .map(v => v);
}
run();
