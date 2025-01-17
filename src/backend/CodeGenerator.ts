import _generate from "@babel/generator";
import * as t from "@babel/types";
import { ProjectUnit } from "../frontend/ProjectBuilder";
import { BlockId, PlaceId } from "../ir";
import { FunctionIR, makeFunctionIRId } from "../ir/core/FunctionIR";
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

  public get entryFunction(): FunctionIR {
    const moduleIR = this.projectUnit.modules.get(this.path)!;
    return moduleIR.functions.get(makeFunctionIRId(0))!;
  }

  generate(): string {
    const statements = generateFunction(this.entryFunction, this);
    const program = t.program(statements);
    return generate(program).code;
  }
}
