import _generate from "@babel/generator";
import * as t from "@babel/types";
import { ProjectUnit } from "../frontend/ProjectBuilder";
import { BasicBlock, BlockId, PlaceId } from "../ir";
import { generateBlock } from "./codegen/generateBlock";

const generate = (_generate as unknown as { default: typeof _generate })
  .default;

/**
 * Generates the code from the IR.
 */
export class CodeGenerator {
  public readonly places: Map<PlaceId, t.Node | null> = new Map();
  public readonly blockToStatements: Map<BlockId, Array<t.Statement>> =
    new Map();
  public readonly generatedBlocks: Set<BlockId> = new Set();

  public readonly blocks: Map<BlockId, BasicBlock>;
  public readonly backEdges: Map<BlockId, Set<BlockId>>;

  constructor(
    public readonly projectUnit: ProjectUnit,
    public readonly path: string,
  ) {
    const moduleUnit = this.projectUnit.modules.get(path)!;
    this.blocks = moduleUnit.blocks;
    this.backEdges = moduleUnit.backEdges;
  }

  generate(): string {
    const statements = generateBlock(this.blocks.keys().next().value!, this);
    const program = t.program(statements);
    return generate(program).code;
  }
}
