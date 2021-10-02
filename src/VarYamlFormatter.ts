import { IEnvVarInfo } from "./IEnvVarInfo";

export class VarYamlFormatter {
    private readonly indent: string;
    private readonly newLineSeparator: string;

    public constructor(newLineSeparator: string = "\n", indent: number = 12) {
        this.indent = " ".repeat(indent);
        this.newLineSeparator = newLineSeparator;
    }
    public format(vars: IEnvVarInfo[] | undefined) {
        vars = vars || [];
        return vars.map(v => this.varToString(v)).join(this.newLineSeparator);
    }

    private varToString(v: IEnvVarInfo) {
        return `${this.indent}- Name: ${v.Name}${this.newLineSeparator}` +
               `${this.indent}  Value: ${v.Value || null}`
    }
}