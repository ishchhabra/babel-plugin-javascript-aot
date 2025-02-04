import * as t from "@babel/types";
import { ProjectUnit } from "../frontend/ProjectBuilder";
import { BlockId, PlaceId } from "../ir";
import { FunctionIR } from "../ir/core/FunctionIR";
/**
 * Generates the code from the IR.
 */
export declare class CodeGenerator {
    readonly path: string;
    readonly projectUnit: ProjectUnit;
    readonly places: Map<PlaceId, t.Node | null>;
    readonly blockToStatements: Map<BlockId, Array<t.Statement>>;
    readonly generatedBlocks: Set<BlockId>;
    constructor(path: string, projectUnit: ProjectUnit);
    get entryFunction(): FunctionIR;
    generate(): string;
}
