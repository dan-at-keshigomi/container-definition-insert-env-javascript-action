import { describe, it, expect } from "@jest/globals";
import { VarParser } from "../src/VarParser"

describe("VarParser", () => {
    it.each([
        ["VAR: VALUE"],
        ["VAR: 'VALUE'"],
        ['VAR: "VALUE"']
    ])
    (".parseVars_withQuotedAndUnquotedValue_getsCorrectNameAndValue", (varLine: string) => {
        // act
        const result = VarParser.parseVars([varLine]);

        // assert
        expect(result).not.toBeUndefined();
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty("Name", "VAR");
        expect(result[0]).toHaveProperty("Value", "VALUE");
    });

    it(".parseVars_withNoValue_usesUndefinedValue", (done: Function) => {
        // act
        const result = VarParser.parseVars(["myvar:"]);

        // assert
        expect(result).not.toBeUndefined();
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty("Name", "myvar");
        expect(result[0]).toHaveProperty("Value", undefined);

        done();
    });

    it(".parseVars_withCommentLines_parsesVarsButIgnoresComments", (done: Function) => {
        // act
        const result = VarParser.parseVars(["// comment 1", "myvar: myval", "# comment 2"]);

        // assert
        expect(result).not.toBeUndefined();
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty("Name", "myvar");
        expect(result[0]).toHaveProperty("Value", "myval");

        done();
    });
});