import core from "@actions/core";
import fs from "fs";
import { IEnvVarInfo } from "./IEnvVarInfo";
import { VarParser } from "./VarParser";
import { VarYamlFormatter } from "./VarYamlFormatter";

export class FileProcessor {
    public async process() {
        try {
            // `encoding` input is optional. if not provided, defaultsto utf-8.
            const encoding: BufferEncoding = (core.getInput("encoding") as BufferEncoding) || "utf-8";

            // `file` input is required, and the file is required to exist
            const filePath = core.getInput("file");
            if (!filePath) {
                throw new Error(`A file path must be provided.`);
            }
            let fileContents: string;
            try {
                fileContents = await fs.promises.readFile(filePath, encoding);
            } catch (err) {
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

            const parsedVars = VarParser.parseVars(vars);
            // const varsString = (parsedVars || []).join(varSeparator);

            const updatedFileContents = this.replaceInContents(
                fileContents || "",
                parsedVars || [],
                varSeparator,
                placeholder,
                indentSize === "auto" ? undefined : Number.parseInt(indentSize));
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
        } catch (error) {
            core.setFailed((error as any).message);
        }
    }

    private replaceInContents(contents: string, vars: IEnvVarInfo[], lineSeparator: string, placeholder: string, requestedIndentSize?: number): string {
        const result = contents.split(lineSeparator).map(l => {
            const indentSize = requestedIndentSize || l.indexOf(placeholder);
            return indentSize > -1 ? new VarYamlFormatter(lineSeparator, indentSize).format(vars) : l;
        }).join(lineSeparator);
        return result;
    }
}