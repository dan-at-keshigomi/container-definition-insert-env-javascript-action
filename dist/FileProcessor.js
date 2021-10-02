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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileProcessor = void 0;
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const VarParser_1 = require("./VarParser");
const VarYamlFormatter_1 = require("./VarYamlFormatter");
class FileProcessor {
    async process() {
        try {
            // `encoding` input is optional. if not provided, defaultsto utf-8.
            const encoding = core.getInput("encoding") || "utf-8";
            // `file` input is required, and the file is required to exist
            const filePath = core.getInput("file");
            if (!filePath) {
                throw new Error(`A file path must be provided.`);
            }
            let fileContents;
            try {
                fileContents = await fs.promises.readFile(filePath, encoding);
            }
            catch (err) {
                throw new Error(`Could not open file with path: ${filePath}`);
            }
            // `placeholder` input is optional and defaults to `${placeholder}`
            const placeholder = core.getInput("placeholder") || "${placeholder}";
            // `vars` input is optional. if not provided, use empty string.
            const vars = core.getMultilineInput("vars");
            // `varSeparator` input is optional. if not provided, use '\n'.
            const varSeparator = core.getInput("varSeparator") || "\n";
            // `indentSize` input is optional. if not provided, uses 'auto'.
            const indentSize = core.getInput("indentSize") || "auto";
            const parsedVars = VarParser_1.VarParser.parseVars(vars);
            // const varsString = (parsedVars || []).join(varSeparator);
            const updatedFileContents = this.replaceInContents(fileContents || "", parsedVars || [], varSeparator, placeholder, indentSize === "auto" ? undefined : Number.parseInt(indentSize));
            // fileContents.replace(placeholder, varsString);
            await fs.promises.writeFile(filePath, updatedFileContents, encoding);
            // // `env-prop-jsonpath` input is required
            // const jsonPath = core.getInput("env-prop-jsonpath");
            // if (!jsonPath) {
            //     throw new Error("The env-prop-jsonpath value must be provided.");
            // }
            // read and parse the yaml file
            // const file = await fs.promises.readFile(filePath);
            // const parsedYaml = yamlParse(fileContents.toString("utf8"));
            // // const parsedVars = VarParser.parseVars(core.getMultilineInput("vars"));
            // // replace the specified node path with the environment variables descriptor
            // jsonpath.apply(parsedYaml, jsonPath, () => parsedVars || []);
            // // save the file
            // await fs.promises.writeFile(filePath, yamlDump(parsedYaml));
        }
        catch (error) {
            core.setFailed(error.message);
        }
    }
    replaceInContents(contents, vars, lineSeparator, placeholder, requestedIndentSize) {
        const result = contents.split(lineSeparator).map(l => {
            const indentSize = requestedIndentSize || l.indexOf(placeholder);
            return indentSize > -1 ? new VarYamlFormatter_1.VarYamlFormatter(lineSeparator, indentSize).format(vars) : l;
        }).join(lineSeparator);
        return result;
    }
}
exports.FileProcessor = FileProcessor;
