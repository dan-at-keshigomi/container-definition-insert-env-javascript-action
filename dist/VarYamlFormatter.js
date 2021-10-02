"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VarYamlFormatter = void 0;
class VarYamlFormatter {
    constructor(newLineSeparator = "\n", indent = 12) {
        this.indent = " ".repeat(indent);
        this.newLineSeparator = newLineSeparator;
    }
    format(vars) {
        vars = vars || [];
        return vars.map(v => this.varToString(v)).join(this.newLineSeparator);
    }
    varToString(v) {
        return `${this.indent}- Name: ${v.Name}${this.newLineSeparator}` +
            `${this.indent}  Value: ${v.Value || null}`;
    }
}
exports.VarYamlFormatter = VarYamlFormatter;
