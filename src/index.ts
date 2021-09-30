import fs from "fs";
import util from "util";
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

import core from "@actions/core";
import github from "@actions/github";

import { yamlParse, yamlDump } from "yaml-cfn";
import jsonpath from "jsonpath";

const placeholder = "${vars-placeholder}";

async function run() {
    try {
        // `file` input is required, and the file is required to exist
        const filePath = core.getInput("file");
        if (!fs.existsSync(filePath)) {
            throw new Error(`Could not find file with path: ${filePath}`);
        }
        // `env-prop-jsonpath` input is required
        const jsonPath = core.getInput("env-prop-jsonpath");
        if (!jsonPath) {
            throw new Error("The env-prop-jsonpath value must be provided.");
        }

        // read and parse the yaml file
        const file = await readFileAsync(filePath);
        const parsedYaml = yamlParse(file.toString("utf8"));
        // replace the specified node path with the environment variables descriptor
        jsonpath.apply(parsedYaml, jsonPath, () => getVars());
        // save the file
        await writeFileAsync(filePath, yamlDump(parsedYaml));
    } catch (error) {
        core.setFailed((error as any).message);
    }
};

interface IEnvVarInfo {
    Name: string;
    Value?: string;
}

interface IVarInfoNamedGroups {
    name?: string;
    value?: string;
}
function parseVarLine2(line?: string): IEnvVarInfo | undefined {
    line = line?.trim();
    if (!line) {
        return undefined;
    }
    const {groups: [ name, value ]} = /^(?<name>.+)\s*\:\s*(?<value>.*)$/g.exec(line)?.groups || {};
    // line has a colon, but no value. set value to undefined
    if (!value) {
        return { Name: name };
    }
    // line has a colon and a value. value may be wrapped in quotes of some sort
    else {
        const valNoWrappingSingleOrDoubleQuotes = trimPairedWrap(trimPairedWrap(value), "'");
        return { Name: name, Value: valNoWrappingSingleOrDoubleQuotes }
    }
}

function trimPairedWrap(str: string, sep: string = "\""): string {
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

function getVars(): IEnvVarInfo[] {
    const output: IEnvVarInfo[] = [];
    const vars: string[] = core.getMultilineInput("vars");
    
    return vars.map(vl => parseVarLine2(vl))
        .filter(v => !!v)
        .map(v => v as IEnvVarInfo);
}

run();