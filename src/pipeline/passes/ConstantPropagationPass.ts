import { createRequire } from "module";
import { ModuleUnit } from "../../frontend/ModuleBuilder";
import { ProjectUnit } from "../../frontend/ProjectBuilder";
import {
  BaseInstruction,
  BasicBlock,
  BinaryExpressionInstruction,
  ExportNamedDeclarationInstruction,
  ExportSpecifierInstruction,
  IdentifierId,
  LiteralInstruction,
  LoadGlobalInstruction,
  LoadLocalInstruction,
  StoreLocalInstruction,
  TPrimitiveValue,
  UnaryExpressionInstruction,
} from "../../ir";

/**
 * A pass that propagates constant values through the program by evaluating expressions
 * with known constant operands at compile time. For example:
 *
 * ```js
 * const a = 5;
 * const b = 3;
 * const c = a + b;    // This will be optimized
 * ```
 *
 * Will be transformed into:
 *
 * ```js
 * const a = 5;
 * const b = 3;
 * const c = 8;        // Computed at compile time!
 * ```
 */
export class ConstantPropagationPass {
  private readonly constants: Map<IdentifierId, TPrimitiveValue>;

  constructor(
    private readonly moduleUnit: ModuleUnit,
    private readonly projectUnit: ProjectUnit,
    private readonly context: Map<
      string,
      Map<string, Map<IdentifierId, TPrimitiveValue>>
    >,
  ) {
    let globalConstants = this.context.get("constants");
    if (globalConstants === undefined) {
      globalConstants = new Map<string, Map<IdentifierId, TPrimitiveValue>>();
      this.context.set("constants", globalConstants);
    }

    let constants = globalConstants.get(this.moduleUnit.path);
    if (constants === undefined) {
      constants = new Map<IdentifierId, TPrimitiveValue>();
      globalConstants.set(this.moduleUnit.path, constants);
    }

    this.constants = constants;
  }

  public run() {
    for (const block of this.moduleUnit.blocks.values()) {
      this.propagateConstantsInBlock(block);
    }

    return { blocks: this.moduleUnit.blocks };
  }

  private propagateConstantsInBlock(block: BasicBlock) {
    for (const [index, instruction] of block.instructions.entries()) {
      const result = this.evaluateInstruction(instruction);
      if (result !== undefined) {
        block.instructions[index] = result;
      }
    }
  }

  private evaluateInstruction(instruction: BaseInstruction) {
    if (instruction instanceof LiteralInstruction) {
      return this.evaluateLiteralInstruction(instruction);
    } else if (instruction instanceof BinaryExpressionInstruction) {
      return this.evaluateBinaryExpressionInstruction(instruction);
    } else if (instruction instanceof UnaryExpressionInstruction) {
      return this.evaluateUnaryExpressionInstruction(instruction);
    } else if (instruction instanceof LoadGlobalInstruction) {
      return this.evaluateLoadGlobalInstruction(instruction);
    } else if (instruction instanceof StoreLocalInstruction) {
      return this.evaluateStoreLocalInstruction(instruction);
    } else if (instruction instanceof LoadLocalInstruction) {
      return this.evaluateLoadLocalInstruction(instruction);
    } else if (instruction instanceof ExportSpecifierInstruction) {
      return this.evaluateExportSpecifierInstruction(instruction);
    } else if (instruction instanceof ExportNamedDeclarationInstruction) {
      return this.evaluateExportNamedDeclarationInstruction(instruction);
    }

    return undefined;
  }

  private evaluateLiteralInstruction(instruction: LiteralInstruction) {
    this.constants.set(instruction.place.identifier.id, instruction.value);
  }

  private evaluateBinaryExpressionInstruction(
    instruction: BinaryExpressionInstruction,
  ) {
    const left = this.constants.get(instruction.left.identifier.id);
    const right = this.constants.get(instruction.right.identifier.id);

    if (left === undefined || right === undefined) {
      return undefined;
    }

    let result: TPrimitiveValue;
    switch (instruction.operator) {
      case "+":
        result = (left as number) + (right as number);
        break;
      case "-":
        result = (left as number) - (right as number);
        break;
      case "*":
        result = (left as number) * (right as number);
        break;
      case "/":
        result = (left as number) / (right as number);
        break;
      case "|":
        result = (left as number) | (right as number);
        break;
      case "&":
        result = (left as number) & (right as number);
        break;
      case "^":
        result = (left as number) ^ (right as number);
        break;
      case ">>":
        result = (left as number) >> (right as number);
        break;
      case ">>>":
        result = (left as number) >>> (right as number);
        break;
      case "==":
        result = left === right;
        break;
      case "!=":
        result = left !== right;
        break;
      case ">":
        result = (left as number) > (right as number);
        break;
      case ">=":
        result = (left as number) >= (right as number);
        break;
      case "<":
        result = (left as number) < (right as number);
        break;
      case "<=":
        result = (left as number) <= (right as number);
        break;
      case "!==":
        result = left !== right;
        break;
      case "===":
        result = left === right;
        break;
      case "%":
        result = (left as number) % (right as number);
        break;
      case "**":
        result = (left as number) ** (right as number);
        break;
      case "<<":
        result = (left as number) << (right as number);
        break;
      default:
        return undefined;
    }

    this.constants.set(instruction.place.identifier.id, result);
    return new LiteralInstruction(
      instruction.id,
      instruction.place,
      instruction.nodePath,
      result,
    );
  }

  private evaluateUnaryExpressionInstruction(
    instruction: UnaryExpressionInstruction,
  ) {
    const operand = this.constants.get(instruction.argument.identifier.id);
    if (operand === undefined) {
      return undefined;
    }

    let result: TPrimitiveValue;
    switch (instruction.operator) {
      case "!":
        result = !operand;
        break;
      case "-":
        result = -(operand as number);
        break;
      case "~":
        result = ~(operand as number);
        break;
      case "+":
        result = +(operand as number);
        break;
      default:
        return undefined;
    }

    this.constants.set(instruction.place.identifier.id, result);
    return new LiteralInstruction(
      instruction.id,
      instruction.place,
      instruction.nodePath,
      result,
    );
  }

  private evaluateStoreLocalInstruction(instruction: StoreLocalInstruction) {
    if (!this.constants.has(instruction.value.identifier.id)) {
      return undefined;
    }

    const value = this.constants.get(instruction.value.identifier.id);
    this.constants.set(instruction.lval.identifier.id, value);
    return undefined;
  }

  private evaluateLoadLocalInstruction(instruction: LoadLocalInstruction) {
    if (!this.constants.has(instruction.value.identifier.id)) {
      return undefined;
    }

    const value = this.constants.get(instruction.value.identifier.id);
    this.constants.set(instruction.place.identifier.id, value);
  }

  private evaluateExportSpecifierInstruction(
    instruction: ExportSpecifierInstruction,
  ) {
    if (!this.constants.has(instruction.local.identifier.id)) {
      return undefined;
    }

    const value = this.constants.get(instruction.local.identifier.id);
    this.constants.set(instruction.place.identifier.id, value);
    return undefined;
  }

  private evaluateExportNamedDeclarationInstruction(
    instruction: ExportNamedDeclarationInstruction,
  ) {
    const declaration = instruction.declaration;
    // For specifiers, they are already evaluated by handling the export specifier instruction.
    if (declaration === undefined) {
      return undefined;
    }

    if (!this.constants.has(declaration.identifier.id)) {
      return undefined;
    }

    const value = this.constants.get(declaration.identifier.id);
    this.constants.set(instruction.place.identifier.id, value);
    return undefined;
  }

  private evaluateLoadGlobalInstruction(instruction: LoadGlobalInstruction) {
    if (instruction.kind === "builtin") {
      return undefined;
    }

    const source = instruction.source!;
    const resolvedSource = resolveModulePath(source, this.moduleUnit.path);

    const globalConstants = this.context.get("constants")!;
    const constantsForSource = globalConstants.get(resolvedSource)!;

    const moduleUnit = this.projectUnit.modules.get(resolvedSource)!;
    const exportInstruction = moduleUnit.exportToInstructions.get(
      instruction.name,
    );
    if (exportInstruction === undefined) {
      return undefined;
    }

    if (!constantsForSource.has(exportInstruction.place.identifier.id)) {
      return undefined;
    }

    const value = constantsForSource.get(exportInstruction.place.identifier.id);
    this.constants.set(instruction.place.identifier.id, value);
    return new LiteralInstruction(
      instruction.id,
      instruction.place,
      instruction.nodePath,
      value,
    );
  }
}

function resolveModulePath(importPath: string, path: string): string {
  const require = createRequire(path);
  return require.resolve(importPath);
}
