import _generate from "@babel/generator";
import * as t from "@babel/types";
import { ProjectUnit } from "../frontend/ProjectBuilder";
import { BindingIdentifierInstruction, BlockId, PlaceId } from "../ir";
import { FunctionIR, makeFunctionIRId } from "../ir/core/FunctionIR";
import { ModuleIR } from "../ir/core/ModuleIR";
import { generateFunction } from "./codegen/generateFunction";
import { generateBindingIdentifierInstruction } from "./codegen/instructions/generateBindingIdentifier";

const generate = (_generate as unknown as { default: typeof _generate })
  .default;

/**
 * Generates the code from the IR.
 */
export class CodeGenerator {
  public readonly places: Map<PlaceId, t.Node | null> = new Map();
  public readonly blockToStatements: Map<BlockId, Array<t.Statement>> =
    new Map();
  public generatedBlocks: Set<BlockId> = new Set();

  constructor(
    public readonly path: string,
    public readonly projectUnit: ProjectUnit,
  ) {}

  public get entryFunction(): FunctionIR {
    const moduleIR = this.projectUnit.modules.get(this.path)!;
    return moduleIR.functions.get(makeFunctionIRId(0))!;
  }

  generate(): string {
    const moduleIR = this.projectUnit.modules.get(this.path)!;
    this.preRegisterBindingIdentifiers(moduleIR);
    const { statements } = generateFunction(this.entryFunction, this);
    const program = t.program(statements);
    return generate(program).code;
  }

  /**
   * Generates code for a specific module in the project. Creates a fresh
   * CodeGenerator instance so per-module state (places, blocks) is isolated.
   */
  generateModule(modulePath: string): string {
    const moduleIR = this.projectUnit.modules.get(modulePath);
    if (!moduleIR) {
      throw new Error(`Module not found: ${modulePath}`);
    }

    const generator = new CodeGenerator(modulePath, this.projectUnit);
    generator.preRegisterBindingIdentifiers(moduleIR);
    const entryFunction = moduleIR.functions.get(makeFunctionIRId(0))!;
    const { statements } = generateFunction(entryFunction, generator);
    const program = t.program(statements);
    return generate(program).code;
  }

  /**
   * Pre-registers all binding identifiers from every function in the module.
   * This ensures cross-function closure references (where a closure in one
   * function references a variable declared in a sibling function) can always
   * resolve the binding's place, regardless of function generation order.
   */
  private preRegisterBindingIdentifiers(moduleIR: ModuleIR): void {
    for (const [, functionIR] of moduleIR.functions) {
      for (const [, block] of functionIR.blocks) {
        for (const instruction of block.instructions) {
          if (instruction instanceof BindingIdentifierInstruction) {
            generateBindingIdentifierInstruction(instruction, this);
          }
        }
      }
    }
  }
}
