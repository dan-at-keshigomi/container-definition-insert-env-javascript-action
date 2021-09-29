import core from "@actions/core";
import github from "@actions/github";
import fs from "fs";
import util from "util";
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

const placeholder = "${vars-placeholder}";

async function run() {
    try {
        // `who-to-greet` input defined in action metadata file
        const filePath = core.getInput("file");
        if (!fs.existsSync(filePath)) {
            throw new Error(`Could not find file with path: ${filePath}`);
        }
        const fileContents = (await readFileAsync(filePath)).toString("utf8");

        const indent = getPlaceholderIndent(fileContents);

        const updatedContents = fileContents.replace(placeholder, getVarsString(indent));

        await writeFileAsync(filePath, updatedContents);

        // Get the JSON webhook payload for the event that triggered the workflow
        const payload = JSON.stringify(github.context.payload, undefined, 2);
        console.log(`The event payload: ${payload}`);

    } catch (error) {
        core.setFailed((error as any).message);
    }
};

function getPlaceholderIndent(fileContents: string): number {
    const fileLines = fileContents.split("\n");
    const placeholderLineIndex = fileLines.findIndex(l => l.match(/placeholder/));
    const placeholderLine = fileLines[placeholderLineIndex];
    return placeholderLine.indexOf(placeholder);
}

function getVarsString(indentSize: number = 11): string {
    const indent = " ".repeat(indentSize);
    const output: string[] = [];
    const vars: string[] = core.getMultilineInput("vars");
    for (const v of vars) {
        const colonIndex = v.indexOf(":");
        const name = v.substr(0, colonIndex - 1);
        const val = v.substr(colonIndex);
        if (val) {
            output.push(
`${indent}- Name: ${name.trim()}
${indent}  Value: ${val.trim()}
`);
        }
    }
    return output.join("");
}

run();