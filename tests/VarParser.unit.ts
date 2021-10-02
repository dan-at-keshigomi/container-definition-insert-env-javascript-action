import { describe, it, expect } from "@jest/globals";
import { VarParser } from "../src/VarParser"

describe("VarParser", () => {
    it(".parseVars_withMultipleLinesOfVars_parsesCorrectVars", () => {
        // arrange
        const testInput = ` >-
            AUTH_ID: "auth_id"
            AUTH_TOKEN: "auth_token"
            DB_URI: "db_uri"`;

        // act
        const result = VarParser.parseVars(testInput.split("\n"));

        // assert
        expect(result).not.toBeUndefined();
        expect(result).toHaveLength(3);
        expect(result && result[0]).toHaveProperty("Name", "AUTH_ID");
        expect(result && result[0]).toHaveProperty("Value", '"auth_id"');
        expect(result && result[2]).toHaveProperty("Name", "DB_URI");
        expect(result && result[2]).toHaveProperty("Value", '"db_uri"');
    })

    it.each([
        ["VAR: VALUE", "VALUE"],
        ["VAR: 'VALUE'", "'VALUE'"],
        ['VAR: "VALUE"', '"VALUE"']
    ])
    (".parseVars_withQuotedAndUnquotedValue_getsCorrectNameAndValue", (varLine: string, expectedValue: string) => {
        // act
        const result = VarParser.parseVars([varLine]);

        // assert
        expect(result).not.toBeUndefined();
        expect(result).toHaveLength(1);
        expect(result && result[0]).toHaveProperty("Name", "VAR");
        expect(result && result[0]).toHaveProperty("Value", expectedValue);
    });

    it(".parseVars_withNoValue_usesUndefinedValue", (done: Function) => {
        // act
        const result = VarParser.parseVars(["myvar:"]);

        // assert
        expect(result).not.toBeUndefined();
        expect(result).toHaveLength(1);
        expect(result && result[0]).toHaveProperty("Name", "myvar");
        expect(result && result[0]).toHaveProperty("Value", undefined);

        done();
    });

    it(".parseVars_withCommentLines_parsesVarsButIgnoresComments", (done: Function) => {
        // act
        const result = VarParser.parseVars(["// comment 1", "myvar: myval", "# comment 2"]);

        // assert
        expect(result).not.toBeUndefined();
        expect(result).toHaveLength(1);
        expect(result && result[0]).toHaveProperty("Name", "myvar");
        expect(result && result[0]).toHaveProperty("Value", "myval");

        done();
    });
});