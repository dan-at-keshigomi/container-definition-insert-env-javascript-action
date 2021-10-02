import { IEnvVarInfo } from "./IEnvVarInfo";

export class VarParser {
    /**
     * Possibilities:
     * // this is a comment
     * # this is a comment
     *
     * # will create MYVAR2 variable entry and set its value to undefined
     * MYVAR2:
     * # will create MYVAR3 variable entry and set its value to 'some value'
     * MYVAR3: 'some value'
     * @returns a parsed environment variable info object
     */
    public static parseVars(varLines: string[]): IEnvVarInfo[]|undefined {
        return (varLines || []).map(vl => VarParser.parseVarLine(vl))
            .filter(v => !!v)
            .map(v => v as IEnvVarInfo);
    }

    private static parseVarLine(line?: string): IEnvVarInfo | undefined {
        line = line?.trim();
        if (!line) {
            return undefined;
        }
        const varAndValRegex = /^(?<name>.+)\s*\:\s*(?<value>.*)$/g;
        const matchedGroups = varAndValRegex.exec(line)?.groups || {};
        const name = matchedGroups["name"];
        const value = matchedGroups["value"];
        // line has no name
        if (!name) {
            return undefined;
        }
        // line has a colon, but no value. set value to undefined
        if (!value) {
            return { Name: name };
        }
        // line has a colon and a value. value may be wrapped in single or double quotes
        else {
            return { Name: name, Value: value /* VarParser.trimQuotes(value) */ }
        }
    }

    /**
     * Trims paired single and double quotes from the start and end of the input string.
     * Ex: `"test" => test`; `'test' => test`; `'test => 'test`; `"test => "test`
     * @param str string to trim quotes from
     * @returns string without hugging quotes
     */
    private static trimQuotes(str: string): string {
        const trimWrapRegex = (sep: string) => new RegExp(`${sep}([^${sep}]+(?=${sep}))${sep}`, "g");
        
        // trim double- and single-quotes (" and ') from start and end
        return str
            .replace(trimWrapRegex(`"`), "$1")
            .replace(trimWrapRegex("'"), "$1");
    }
}