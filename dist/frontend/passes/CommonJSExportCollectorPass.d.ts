import { FunctionIR } from "../../ir/core/FunctionIR";
import { ModuleIR } from "../../ir/core/ModuleIR";
/**
 * A pass that scans for and collects CommonJS exports in the IR, populating the
 * `moduleUnit.exports` map accordingly. This identifiers assignments to
 * `module.exports` (or `exports`) and  marks those properties or values
 * as module exports at the IR level.
 *
 *  Example:
 * ```js
 * // Original code:
 * module.exports.foo = 42;
 *
 * // After this pass, `moduleUnit.exports` will have an entry for "foo"
 * // referencing the IR node that produced the value 42.
 * ```
 */
export declare class CommonJSExportCollectorPass {
    private readonly functionIR;
    private readonly moduleIR;
    constructor(functionIR: FunctionIR, moduleIR: ModuleIR);
    run(): void;
    private isModuleExportInstruction;
    private isAlwaysExecutedBlock;
}
