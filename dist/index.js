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
const core_1 = __importDefault(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const readFileAsync = util_1.default.promisify(fs_1.default.readFile);
const writeFileAsync = util_1.default.promisify(fs_1.default.writeFile);
const placeholder = "${vars-placeholder}";
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // `who-to-greet` input defined in action metadata file
            const filePath = core_1.default.getInput("file");
            if (!fs_1.default.existsSync(filePath)) {
                throw new Error(`Could not find file with path: ${filePath}`);
            }
            const fileContents = (yield readFileAsync(filePath)).toString("utf8");
            const indent = getPlaceholderIndent(fileContents);
            const updatedContents = fileContents.replace(placeholder, getVarsString(indent));
            yield writeFileAsync(filePath, updatedContents);
            // Get the JSON webhook payload for the event that triggered the workflow
            const payload = JSON.stringify(github_1.default.context.payload, undefined, 2);
            console.log(`The event payload: ${payload}`);
        }
        catch (error) {
            core_1.default.setFailed(error.message);
        }
    });
}
;
function getPlaceholderIndent(fileContents) {
    const fileLines = fileContents.split("\n");
    const placeholderLineIndex = fileLines.findIndex(l => l.match(/placeholder/));
    const placeholderLine = fileLines[placeholderLineIndex];
    return placeholderLine.indexOf(placeholder);
}
function getVarsString(indentSize = 11) {
    const indent = " ".repeat(indentSize);
    const output = [];
    const vars = core_1.default.getMultilineInput("vars");
    for (const v of vars) {
        const colonIndex = v.indexOf(":");
        const name = v.substr(0, colonIndex - 1);
        const val = v.substr(colonIndex);
        if (val) {
            output.push(`${indent}- Name: ${name.trim()}
${indent}  Value: ${val.trim()}
`);
        }
    }
    return output.join("");
}
run();
