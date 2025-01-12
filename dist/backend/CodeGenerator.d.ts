import { ProjectUnit } from "../frontend/ProjectBuilder";
/**
 * Generates the code from the IR.
 */
export declare class CodeGenerator {
    #private;
    private readonly projectUnit;
    private readonly path;
    private readonly places;
    private readonly blockToStatements;
    private readonly generatedBlocks;
    private readonly blocks;
    private readonly backEdges;
    constructor(projectUnit: ProjectUnit, path: string);
    generate(): string;
}
