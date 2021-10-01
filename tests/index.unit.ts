import { describe, it, expect } from "@jest/globals";
import core from "@actions/core";
jest.mock("@actions/core", () => ({
    setFailed: jest.fn(),
    getInput: jest.fn(),
    getMultilineInput: jest.fn()
}));
import fs, { PathLike } from "fs";
import { FileHandle } from "fs/promises";
import { Stream } from "stream";

import { run } from "../src/index";

describe("run", () => {
    it("withValidVars_insertsVarsIntoEnvironmentBlock", async () => {
        // arrange
        const testVar1 = "testVar1";
        const testValue1 = "testValue1";
        const testVar2 = "testVar2";
        const testValue2 = "testValue2";
        const inputs: IInputs = {
            ["file"]: "a file path",
            ["env-prop-jsonpath"]: "$.Resources.TaskDefinition.Properties.ContainerDefinitions[0].Environment",
            ["vars"]: [`${testVar1}: ${testValue1}`, `${testVar2}: ${testValue2}`, "// comment"].join("\n")
        };
        mockCoreInputs(inputs);

        jest.spyOn(fs, "existsSync").mockImplementation(() => true);
        mockReadFile(`
            Resources:
              TaskDefinition:
                Properties:
                  ContainerDefinitions:
                    - Environment:`);
        let result = undefined;
        mockWriteFile((contents) => result = contents);
        
        // act
        await run();

        // assert
        expect(result).not.toBeUndefined();
        expect(result).toContain(`- Name: ${testVar1}`);
        expect(result).toContain(`Value: ${testValue1}`);
    });

    it.each([
        [""],
        [null],
        [undefined]
    ])
    ("withNoVars_setsEnvironmentBlockToEmpty", async (varsValue) => {
        // arrange
        const inputs: IInputs = {
            ["file"]: "a file path",
            ["env-prop-jsonpath"]: "$.Resources.TaskDefinition.Properties.ContainerDefinitions[0].Environment",
            ["vars"]: varsValue
        };
        mockCoreInputs(inputs);

        jest.spyOn(fs, "existsSync").mockImplementation(() => true);
        mockReadFile(`
            Resources:
              TaskDefinition:
                Properties:
                  ContainerDefinitions:
                    - Environment:`);
        let result = undefined;
        mockWriteFile((contents) => result = contents);

        // act
        await run();

        // assert
        expect(result).not.toBeUndefined();
        expect(result).toMatch(/^[\s\S]*- Environment: \[\][\s\S]*$/gm);
    });

    it("withMissingFileInput_failsAction", async () => {
        // arrange
        const inputs: IInputs = {
            ["file"]: undefined,
            ["env-prop-jsonpath"]: "$.Resources.TaskDefinition.Properties.ContainerDefinitions[0].Environment"
        };
        mockCoreInputs(inputs);
        let error = undefined;
        (core.setFailed as jest.MockedFunction<any>).mockImplementation((message: string) => error = message);

        // act
        await run();

        // assert
        expect(error).not.toBeUndefined();
        expect(error).toContain("Could not find file with path");
    });

    it("withMissingEnvPropJsonpathInput_failsAction", async () => {
        // arrange
        const inputs: IInputs = {
            ["file"]: "a file name",
            ["env-prop-jsonpath"]: undefined
        };
        mockCoreInputs(inputs);
        let error = undefined;
        (core.setFailed as jest.MockedFunction<any>).mockImplementation((message: string) => error = message);
        jest.spyOn(fs, "existsSync").mockImplementation(() => true);

        // act
        await run();

        // assert
        expect(error).not.toBeUndefined();
        expect(error).toContain("The env-prop-jsonpath value must be provided");
    });
});

interface IInputs {
    [key: string]: string|undefined
}

function mockCoreInputs(inputs: { [key: string]: string | undefined }) {
    (core.getInput as jest.MockedFunction<any>)
        .mockImplementation((name: string) => inputs[name]);
    (core.getMultilineInput as jest.MockedFunction<any>)
        .mockImplementation((name: string) => inputs[name]?.split("\n"));
}

function mockWriteFile(callback: (contents: string) => void) {
    // let result = undefined;
    jest.spyOn(fs.promises, "writeFile").mockImplementation(
        (file: PathLike | FileHandle,
            contents: string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView> | Stream): Promise<void> => {
            // result = contents;
            callback(contents.toString());
            return Promise.resolve();
        });
}

function mockReadFile(contents: string) {
    jest.spyOn(fs.promises, "readFile").mockImplementation(
        () => Promise.resolve(Buffer.from(contents, "utf-8")));
}