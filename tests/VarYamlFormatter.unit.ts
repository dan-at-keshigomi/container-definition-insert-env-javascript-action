import { IEnvVarInfo } from "../src/IEnvVarInfo";
import {VarYamlFormatter} from "../src/VarYamlFormatter";

describe("VarYamlFormatter", () => {
    it("ll", () => {
        // arrange
        const testVars: IEnvVarInfo[] = [
            { Name: "SMARTY_AUTH_ID", Value: '"b50737db-9bb2-768f-bb84-2fe07"' }
        ];
        
        // act
        const result = new VarYamlFormatter("\n").format(testVars);

        expect(result).not.toBeNull();
    })
})