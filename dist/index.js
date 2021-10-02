"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FileProcessor_1 = require("./FileProcessor");
// export async function run() {
//     try {
//         // `file` input is required, and the file is required to exist
//         const filePath = core.getInput("file");
//         if (!fs.existsSync(filePath)) {
//             throw new Error(`Could not find file with path: ${filePath}`);
//         }
//         // `env-prop-jsonpath` input is required
//         const jsonPath = core.getInput("env-prop-jsonpath");
//         if (!jsonPath) {
//             throw new Error("The env-prop-jsonpath value must be provided.");
//         }
//         // read and parse the yaml file
//         const file = await fs.promises.readFile(filePath);
//         const parsedYaml = yamlParse(file.toString("utf8"));
//         const parsedVars = VarParser.parseVars(core.getMultilineInput("vars"));
//         // replace the specified node path with the environment variables descriptor
//         jsonpath.apply(parsedYaml, jsonPath, () => parsedVars || []);
//         // save the file
//         await fs.promises.writeFile(filePath, yamlDump(parsedYaml));
//     } catch (error) {
//         core.setFailed((error as any).message);
//     }
// };
new FileProcessor_1.FileProcessor().process();
