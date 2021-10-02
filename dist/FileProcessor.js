"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileProcessor = void 0;
const core_1 = __importDefault(require("@actions/core"));
const fs_1 = __importDefault(require("fs"));
const VarParser_1 = require("./VarParser");
const VarYamlFormatter_1 = require("./VarYamlFormatter");
class FileProcessor {
    async process() {
        try {
            // `encoding` input is optional. if not provided, defaultsto utf-8.
            const encoding = core_1.default.getInput("encoding") || "utf-8";
            // `file` input is required, and the file is required to exist
            const filePath = core_1.default.getInput("file");
            let fileContents;
            try {
                fileContents = await fs_1.default.promises.readFile(filePath, encoding);
            }
            catch (err) {
                throw new Error(`Could not open file with path: ${filePath}`);
            }
            // `placeholder` input is optional and defaults to `${placeholder}`
            const placeholder = core_1.default.getInput("placeholder") || "${placeholder}";
            // `vars` input is optional. if not provided, use empty string.
            const vars = core_1.default.getMultilineInput("vars");
            // `varSeparator` input is optional. if not provided, use '\n'.
            const varSeparator = core_1.default.getInput("varSeparator");
            // `indentSize` input is optional. if not provided, uses 'auto'.
            const indentSize = core_1.default.getInput("indentSize") || "auto";
            const parsedVars = VarParser_1.VarParser.parseVars(vars);
            // const varsString = (parsedVars || []).join(varSeparator);
            const updatedFileContents = this.replaceInContents(fileContents, parsedVars || [], varSeparator, placeholder, indentSize === "auto" ? undefined : Number.parseInt(indentSize));
            // fileContents.replace(placeholder, varsString);
            await fs_1.default.promises.writeFile(filePath, updatedFileContents, encoding);
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
            core_1.default.setFailed(error.message);
        }
    }
    replaceInContents(contents, vars, lineSeparator, placeholder, requestedIndentSize) {
        return contents.split(lineSeparator).map(l => {
            const indentSize = requestedIndentSize || l.indexOf(placeholder);
            return indentSize > -1 ? new VarYamlFormatter_1.VarYamlFormatter(lineSeparator, indentSize).format(vars) : l;
        }).join(lineSeparator);
    }
}
exports.FileProcessor = FileProcessor;
