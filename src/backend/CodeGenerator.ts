import _generate from "@babel/generator";
import * as t from "@babel/types";
import { ProjectUnit } from "../frontend/ProjectBuilder";
import { BlockId, PlaceId } from "../ir";
import { generateFunction } from "./codegen/generateFunction";

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

  constructor(
    public readonly path: string,
    public readonly projectUnit: ProjectUnit,
  ) {}

  generate(): string {
    const moduleIR = this.projectUnit.modules.get(this.path)!;
    const functionIR = moduleIR.functions.values().next().value!;
    const statements = generateFunction(functionIR, this);
    const program = t.program(statements);
    return generate(program).code;
  }
}
