import _generate from "@babel/generator";
import { isKeyword } from "@babel/helper-validator-identifier";
import * as t from "@babel/types";
import { assertJSXChild } from "../babel-utils";
import {
  ArrayExpressionInstruction,
  ArrayPatternInstruction,
  BaseInstruction,
  BaseTerminal,
  BasicBlock,
  BinaryExpressionInstruction,
  BlockId,
  BranchTerminal,
  CallExpressionInstruction,
  CopyInstruction,
  ExpressionInstruction,
  ExpressionStatementInstruction,
  FunctionDeclarationInstruction,
  HoleInstruction,
  JumpTerminal,
  LiteralInstruction,
  LoadGlobalInstruction,
  LoadLocalInstruction,
  LogicalExpressionInstruction,
  MemberExpressionInstruction,
  MiscellaneousInstruction,
  PatternInstruction,
  Place,
  PlaceId,
  ReturnTerminal,
  SpreadElementInstruction,
  StatementInstruction,
  StoreLocalInstruction,
  UnaryExpressionInstruction,
  UnsupportedNodeInstruction,
} from "../frontend/ir";
import {
  ExportDefaultDeclarationInstruction,
  ExportNamedDeclarationInstruction,
  ExportSpecifierInstruction,
  IdentifierInstruction,
  ImportDeclarationInstruction,
  ImportSpecifierInstruction,
  JSXElementInstruction,
  JSXFragmentInstruction,
  JSXInstruction,
  JSXTextInstruction,
  ObjectExpressionInstruction,
  ObjectMethodInstruction,
  ObjectPropertyInstruction,
} from "../frontend/ir/Instruction";
import { ProjectUnit } from "../frontend/ProjectBuilder";

const generate = (_generate as unknown as { default: typeof _generate })
  .default;

/**
 * Generates the code from the IR.
 */
export class CodeGenerator {
  private readonly places: Map<PlaceId, t.Node | null> = new Map();
  private readonly blockToStatements: Map<BlockId, Array<t.Statement>> =
    new Map();
  private readonly generatedBlocks: Set<BlockId> = new Set();

  private readonly blocks: Map<BlockId, BasicBlock>;
  private readonly backEdges: Map<BlockId, Set<BlockId>>;

  constructor(
    private readonly projectUnit: ProjectUnit,
    private readonly path: string,
  ) {
    const moduleUnit = this.projectUnit.modules.get(path)!;
    this.blocks = moduleUnit.blocks;
    this.backEdges = moduleUnit.backEdges;
  }

  generate(): string {
    const statements = this.#generateBlock(this.blocks.keys().next().value!);
    const program = t.program(statements);
    return generate(program).code;
  }

  /******************************************************************************
   * Code Generation
   *
   * Methods for generating code from different IR components
   ******************************************************************************/

  #generateInstruction(instruction: BaseInstruction): Array<t.Statement> {
    const statements: Array<t.Statement> = [];

    if (instruction instanceof ExpressionInstruction) {
      this.#generateExpression(instruction);
    } else if (instruction instanceof StatementInstruction) {
      const node = this.#generateStatement(instruction);
      if (!t.isExportSpecifier(node)) {
        statements.push(node);
      }
    } else if (instruction instanceof PatternInstruction) {
      this.#generatePattern(instruction);
    } else if (instruction instanceof JSXInstruction) {
      this.#generateJSX(instruction);
    } else if (instruction instanceof MiscellaneousInstruction) {
      this.#generateMiscellaneousNode(instruction);
    } else if (instruction instanceof UnsupportedNodeInstruction) {
      const node = this.#generateUnsupportedNodeInstruction(instruction);
      if (t.isStatement(node)) {
        statements.push(node);
      }
    }

    return statements;
  }

  #generateUnsupportedNodeInstruction(
    instruction: UnsupportedNodeInstruction,
  ): t.Node {
    const node = instruction.node;
    this.places.set(instruction.place.id, node);
    return node;
  }

  /******************************************************************************
   * Block Generation
   *
   * Methods for generating code from different types of blocks
   ******************************************************************************/
  #generateBlock(blockId: BlockId): Array<t.Statement> {
    if (this.generatedBlocks.has(blockId)) {
      return [];
    }

    this.generatedBlocks.add(blockId);

    const block = this.blocks.get(blockId);
    if (block === undefined) {
      throw new Error(`Block ${blockId} not found`);
    }

    const statements = this.#generateBasicBlock(blockId);
    this.blockToStatements.set(blockId, statements);
    return statements;
  }

  #generateBasicBlock(blockId: BlockId): Array<t.Statement> {
    const block = this.blocks.get(blockId);
    if (block === undefined) {
      throw new Error(`Block ${blockId} not found`);
    }

    const statements: Array<t.Statement> = [];
    for (const instruction of block.instructions) {
      statements.push(...this.#generateInstruction(instruction));
    }

    const backEdges = this.backEdges.get(blockId)!;
    if (backEdges.size > 1) {
      throw new Error(`Block ${blockId} has multiple back edges`);
    }

    if (backEdges.size > 0) {
      return this.#generateBackEdge(blockId);
    }

    const terminal = block.terminal;
    if (terminal !== undefined) {
      statements.push(...this.#generateTerminal(terminal));
    }

    this.blockToStatements.set(blockId, statements);
    return statements;
  }

  #generateBackEdge(blockId: BlockId): Array<t.Statement> {
    const terminal = this.blocks.get(blockId)!.terminal!;
    if (!(terminal instanceof BranchTerminal)) {
      throw new Error(
        `Unsupported back edge from ${blockId} to ${blockId} (${terminal.constructor.name})`,
      );
    }

    const test = this.places.get(terminal.test.id);
    if (test === undefined) {
      throw new Error(`Place ${terminal.test.id} not found`);
    }

    t.assertExpression(test);

    const bodyInstructions = this.#generateBasicBlock(terminal.consequent);
    // NOTE: No need to generate the consequent block, because in a while loop,
    // the same as the fallthrough block.
    const exitInstructions = this.#generateBasicBlock(terminal.fallthrough);

    const node = t.whileStatement(test, t.blockStatement(bodyInstructions));
    return [node, ...exitInstructions];
  }

  /******************************************************************************
   * Terminal Generation
   *
   * Methods for generating code from different types of block terminals
   ******************************************************************************/
  #generateTerminal(terminal: BaseTerminal): Array<t.Statement> {
    if (terminal instanceof BranchTerminal) {
      return this.#generateBranchTerminal(terminal);
    } else if (terminal instanceof JumpTerminal) {
      return this.#generateJumpTerminal(terminal);
    } else if (terminal instanceof ReturnTerminal) {
      return this.#generateReturnTerminal(terminal);
    }

    throw new Error(`Unsupported terminal type: ${terminal.constructor.name}`);
  }

  #generateBranchTerminal(terminal: BranchTerminal): Array<t.Statement> {
    // Generate the fallthrough block first so that we do not rebuild it
    // if the alternate block is the same as the fallthrough block.
    const fallthrough = this.#generateBlock(terminal.fallthrough);

    const test = this.places.get(terminal.test.id);
    if (test === undefined) {
      throw new Error(`Place ${terminal.test.id} not found`);
    }

    t.assertExpression(test);

    const consequent = this.#generateBlock(terminal.consequent);
    let alternate;
    if (terminal.alternate !== terminal.fallthrough) {
      alternate = this.#generateBlock(terminal.alternate);
    }

    const node = t.ifStatement(
      test,
      t.blockStatement(consequent),
      alternate ? t.blockStatement(alternate) : null,
    );

    const statements = [node, ...fallthrough];
    return statements;
  }

  #generateJumpTerminal(terminal: JumpTerminal): Array<t.Statement> {
    const target = this.#generateBlock(terminal.target);
    return target;
  }

  #generateReturnTerminal(terminal: ReturnTerminal): Array<t.Statement> {
    const value = this.places.get(terminal.value.id);
    if (value === undefined) {
      throw new Error(`Place ${terminal.value.id} not found`);
    }

    t.assertExpression(value);
    return [t.returnStatement(value)];
  }

  /******************************************************************************
   * Expression Generation
   *
   * Methods for generating code from different types of expressions
   ******************************************************************************/
  #generateExpression(instruction: ExpressionInstruction): t.Expression | null {
    if (instruction instanceof ArrayExpressionInstruction) {
      return this.#generateArrayExpression(instruction);
    } else if (instruction instanceof BinaryExpressionInstruction) {
      return this.#generateBinaryExpression(instruction);
    } else if (instruction instanceof CallExpressionInstruction) {
      return this.#generateCallExpression(instruction);
    } else if (instruction instanceof CopyInstruction) {
      return this.#generateCopyInstruction(instruction);
    } else if (instruction instanceof LiteralInstruction) {
      return this.#generateLiteralExpression(instruction);
    } else if (instruction instanceof LoadGlobalInstruction) {
      return this.#generateLoadGlobalInstruction(instruction);
    } else if (instruction instanceof LoadLocalInstruction) {
      return this.#generateLoadLocalInstruction(instruction);
    } else if (instruction instanceof LogicalExpressionInstruction) {
      return this.#generateLogicalExpression(instruction);
    } else if (instruction instanceof MemberExpressionInstruction) {
      return this.#generateMemberExpression(instruction);
    } else if (instruction instanceof ObjectExpressionInstruction) {
      return this.#generateObjectExpression(instruction);
    } else if (instruction instanceof UnaryExpressionInstruction) {
      return this.#generateUnaryExpression(instruction);
    } else if (instruction instanceof IdentifierInstruction) {
      return this.#generateIdentifierInstruction(instruction);
    }

    throw new Error(
      `Unsupported expression type: ${instruction.constructor.name}`,
    );
  }

  #generateArrayExpression(
    instruction: ArrayExpressionInstruction,
  ): t.Expression {
    const elements = instruction.elements.map((element) => {
      const node = this.places.get(element.id);
      if (node === undefined) {
        throw new Error(`Place ${element.id} not found`);
      }

      if (node === null || t.isSpreadElement(node)) {
        return node;
      }

      t.assertExpression(node);
      return node;
    });

    const node = t.arrayExpression(elements);
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateBinaryExpression(
    instruction: BinaryExpressionInstruction,
  ): t.Expression {
    const left = this.places.get(instruction.left.id);
    if (left === undefined) {
      throw new Error(`Place ${instruction.left.id} not found`);
    }

    const right = this.places.get(instruction.right.id);
    if (right === undefined) {
      throw new Error(`Place ${instruction.right.id} not found`);
    }

    t.assertExpression(left);
    t.assertExpression(right);

    const node = t.binaryExpression(instruction.operator, left, right);
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateCallExpression(
    instruction: CallExpressionInstruction,
  ): t.Expression {
    const callee = this.places.get(instruction.callee.id);
    if (callee === undefined) {
      throw new Error(`Place ${instruction.callee.id} not found`);
    }

    t.assertExpression(callee);

    const args = instruction.args.map((argument) => {
      const node = this.places.get(argument.id);
      if (node === undefined) {
        throw new Error(`Place ${argument.id} not found`);
      }

      t.assertExpression(node);
      return node;
    });

    const node = t.callExpression(callee, args);
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateCopyInstruction(instruction: CopyInstruction): t.Expression {
    const lval = t.identifier(instruction.lval.identifier.name);
    const value = this.places.get(instruction.value.id);
    if (value === undefined) {
      throw new Error(`Place ${instruction.value.id} not found`);
    }

    t.assertExpression(value);

    const node = t.assignmentExpression("=", lval, value);
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateLiteralExpression(instruction: LiteralInstruction): t.Expression {
    const node = t.valueToNode(instruction.value);
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateLoadGlobalInstruction(
    instruction: LoadGlobalInstruction,
  ): t.Expression {
    const node = t.identifier(instruction.name);
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateLoadLocalInstruction(
    instruction: LoadLocalInstruction,
  ): t.Expression {
    const node = t.identifier(instruction.value.identifier.name);
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateLogicalExpression(
    instruction: LogicalExpressionInstruction,
  ): t.Expression {
    const left = this.places.get(instruction.left.id);
    if (left === undefined) {
      throw new Error(`Place ${instruction.left.id} not found`);
    }

    const right = this.places.get(instruction.right.id);
    if (right === undefined) {
      throw new Error(`Place ${instruction.right.id} not found`);
    }

    t.assertExpression(left);
    t.assertExpression(right);

    const node = t.logicalExpression(instruction.operator, left, right);
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateMemberExpression(
    instruction: MemberExpressionInstruction,
  ): t.Expression {
    const object = this.places.get(instruction.object.id);
    if (object === undefined) {
      throw new Error(`Place ${instruction.object.id} not found`);
    }

    const property = this.places.get(instruction.property.id);
    if (property === undefined) {
      throw new Error(`Place ${instruction.property.id} not found`);
    }

    t.assertExpression(object);

    this.#assertNonNull(property);
    if (!t.isIdentifier(property) && !t.isPrivateName(property)) {
      throw new Error(
        `Unsupported property type: ${property.constructor.name}`,
      );
    }

    const node = t.memberExpression(object, property);
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateObjectExpression(
    instruction: ObjectExpressionInstruction,
  ): t.ObjectExpression {
    const properties = instruction.properties.map((property) => {
      const propertyNode = this.places.get(property.id);
      if (propertyNode === undefined) {
        throw new Error(`Place ${property.id} not found`);
      }

      if (
        !t.isObjectProperty(propertyNode) &&
        !t.isObjectMethod(propertyNode)
      ) {
        throw new Error(`Unsupported property type: ${propertyNode?.type}`);
      }

      return propertyNode;
    });

    const node = t.objectExpression(properties);
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateUnaryExpression(
    instruction: UnaryExpressionInstruction,
  ): t.Expression {
    const argument = this.places.get(instruction.argument.id);
    if (argument === undefined) {
      throw new Error(`Place ${instruction.argument.id} not found`);
    }

    t.assertExpression(argument);
    const node = t.unaryExpression(instruction.operator, argument);
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateIdentifierInstruction(
    instruction: IdentifierInstruction,
  ): t.Expression {
    const node = t.identifier(instruction.name);
    this.places.set(instruction.place.id, node);
    return node;
  }

  /******************************************************************************
   * Statement Generation
   *
   * Methods for generating code from different types of statements
   ******************************************************************************/
  #generateStatement(instruction: StatementInstruction): t.Statement {
    if (instruction instanceof ExportDefaultDeclarationInstruction) {
      return this.#generateExportDefaultDeclaration(instruction);
    } else if (instruction instanceof ExportNamedDeclarationInstruction) {
      return this.#generateExportNamedDeclaration(instruction);
    } else if (instruction instanceof ExportSpecifierInstruction) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return this.#generateExportSpecifier(instruction) as any;
    } else if (instruction instanceof ExpressionStatementInstruction) {
      return this.#generateExpressionStatement(instruction);
    } else if (instruction instanceof FunctionDeclarationInstruction) {
      return this.#generateFunctionDeclaration(instruction);
    } else if (instruction instanceof ImportDeclarationInstruction) {
      return this.#generateImportDeclaration(instruction);
    } else if (instruction instanceof StoreLocalInstruction) {
      return this.#generateStoreLocalInstruction(instruction);
    }

    throw new Error(
      `Unsupported statement type: ${instruction.constructor.name}`,
    );
  }

  #generateExportNamedDeclaration(
    instruction: ExportNamedDeclarationInstruction,
  ): t.Statement {
    if (instruction.declaration !== undefined) {
      const declaration = this.places.get(instruction.declaration.id);
      if (declaration === undefined) {
        throw new Error(`Place ${instruction.declaration.id} not found`);
      }

      t.assertDeclaration(declaration);
      const node = t.exportNamedDeclaration(declaration, []);
      this.places.set(instruction.place.id, node);
      return node;
    }

    const specifiers = instruction.specifiers.map((specifier) => {
      const node = this.places.get(specifier.id);
      if (node === undefined) {
        throw new Error(`Place ${specifier.id} not found`);
      }

      t.assertExportSpecifier(node);
      return node;
    });

    const node = t.exportNamedDeclaration(null, specifiers);
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateExportDefaultDeclaration(
    instruction: ExportDefaultDeclarationInstruction,
  ): t.Statement {
    const declaration = this.places.get(instruction.declaration.id);
    if (declaration === undefined) {
      throw new Error(`Place ${instruction.declaration.id} not found`);
    }

    if (
      !t.isFunctionDeclaration(declaration) &&
      !t.isClassDeclaration(declaration) &&
      !t.isExpression(declaration)
    ) {
      throw new Error(
        `Unsupported export default declaration type: ${declaration?.type}`,
      );
    }

    return t.exportDefaultDeclaration(declaration);
  }

  #generateExportSpecifier(
    instruction: ExportSpecifierInstruction,
  ): t.ExportSpecifier {
    const local = this.places.get(instruction.local.id);
    if (local === undefined) {
      throw new Error(`Place ${instruction.local.id} not found`);
    }

    t.assertIdentifier(local);

    const exported =
      t.isValidIdentifier(instruction.exported) ||
      isKeyword(instruction.exported)
        ? t.identifier(instruction.exported)
        : t.stringLiteral(instruction.exported);

    const node = t.exportSpecifier(local, exported);
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateExpressionStatement(
    instruction: ExpressionStatementInstruction,
  ): t.Statement {
    const expression = this.places.get(instruction.expression.id);
    if (expression === undefined) {
      throw new Error(`Place ${instruction.expression.id} not found`);
    }

    t.assertExpression(expression);
    const node = t.expressionStatement(expression);
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateFunctionDeclaration(
    instruction: FunctionDeclarationInstruction,
  ): t.Statement {
    // Since this is the first time we're using param, it does not exist in the
    // places map. We need to create a new identifier for it.
    const paramNodes = instruction.params.map((param) => {
      const identifier = t.identifier(param.identifier.name);
      this.places.set(param.id, identifier);
      return identifier;
    });

    // Since this is the first time we're using the function name, it does not
    // exist in the places map. We need to create a new identifier for it.
    const idNode = t.identifier(instruction.place.identifier.name);
    this.places.set(instruction.place.id, idNode);

    const body = this.#generateBlock(instruction.body);
    const node = t.functionDeclaration(
      idNode,
      paramNodes,
      t.blockStatement(body),
      instruction.generator,
      instruction.async,
    );
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateImportDeclaration(
    instruction: ImportDeclarationInstruction,
  ): t.Statement {
    const source = t.valueToNode(instruction.source);
    const specifiers = instruction.specifiers.map((specifier) => {
      const node = this.places.get(specifier.id);
      if (node === undefined) {
        throw new Error(`Place ${specifier.id} not found`);
      }

      t.assertImportSpecifier(node);
      return node;
    });

    return t.importDeclaration(specifiers, source);
  }

  #generateImportSpecifier(
    instruction: ImportSpecifierInstruction,
  ): t.ImportSpecifier {
    const imported = this.places.get(instruction.imported.id);
    if (imported === undefined) {
      throw new Error(`Place ${instruction.imported.id} not found`);
    }

    t.assertIdentifier(imported);

    // Handle case where local is undefined
    let local = imported;
    if (instruction.local) {
      const localNode = this.places.get(instruction.local.id);
      if (localNode === undefined) {
        throw new Error(`Place ${instruction.local.id} not found`);
      }
      t.assertIdentifier(localNode);
      local = localNode;
    }

    const node = t.importSpecifier(imported, local);
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateStoreLocalInstruction(
    instruction: StoreLocalInstruction,
  ): t.Statement {
    // Since this is the first time we're using lval, it does not exist in the
    // places map. We need to create a new identifier for it.
    const lval = this.#lookupPlace(instruction.lval, true);
    this.places.set(instruction.lval.id, lval);

    const value = this.places.get(instruction.value.id);
    if (value === undefined) {
      throw new Error(`Place ${instruction.value.id} not found`);
    }

    t.assertLVal(lval);
    t.assertExpression(value);

    const node = t.variableDeclaration(instruction.type, [
      t.variableDeclarator(lval, value),
    ]);
    this.places.set(instruction.place.id, node);
    return node;
  }

  /******************************************************************************
   * Pattern Generation
   *
   * Methods for generating code from different types of patterns
   ******************************************************************************/

  #generatePattern(instruction: PatternInstruction): t.Pattern {
    if (instruction instanceof ArrayPatternInstruction) {
      return this.#generateArrayPattern(instruction);
    }

    throw new Error(
      `Unsupported pattern type: ${instruction.constructor.name}`,
    );
  }

  #generateArrayPattern(instruction: ArrayPatternInstruction): t.ArrayPattern {
    const elements = instruction.elements.map((element) => {
      const node = this.places.get(element.id);
      if (node === undefined) {
        throw new Error(`Place ${element.id} not found`);
      }

      t.assertLVal(node);
      return node;
    });

    const node = t.arrayPattern(elements);
    this.places.set(instruction.place.id, node);
    return node;
  }

  /******************************************************************************
   * JSX Generation
   *
   * Methods for generating code from different types of JSX nodes
   ******************************************************************************/

  #generateJSX(instruction: JSXInstruction): t.JSX {
    if (instruction instanceof JSXElementInstruction) {
      return this.#generateJSXElement(instruction);
    } else if (instruction instanceof JSXFragmentInstruction) {
      return this.#generateJSXFragment(instruction);
    } else if (instruction instanceof JSXTextInstruction) {
      return this.#generateJSXText(instruction);
    }

    throw new Error(
      `Unsupported JSX node type: ${instruction.constructor.name}`,
    );
  }

  #generateJSXElement(instruction: JSXElementInstruction): t.JSXElement {
    const openingElement = this.places.get(instruction.openingElement.id);
    if (openingElement === undefined) {
      throw new Error(`Place ${instruction.openingElement.id} not found`);
    }

    t.assertJSXOpeningElement(openingElement);

    const closingElement = this.places.get(instruction.closingElement.id);
    if (closingElement === undefined) {
      throw new Error(`Place ${instruction.closingElement.id} not found`);
    }

    if (closingElement !== null && !t.isJSXClosingElement(closingElement)) {
      throw new Error(
        `Unsupported JSX closing element type: ${closingElement.constructor.name}`,
      );
    }

    const children = instruction.children.map((child) => {
      const node = this.places.get(child.id);
      if (node === undefined) {
        throw new Error(`Place ${child.id} not found`);
      }

      assertJSXChild(node);
      return node;
    });

    const node = t.jsxElement(openingElement, closingElement, children);
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateJSXFragment(instruction: JSXFragmentInstruction): t.JSXFragment {
    const openingFragment = this.places.get(instruction.openingFragment.id);
    if (openingFragment === undefined) {
      throw new Error(`Place ${instruction.openingFragment.id} not found`);
    }

    t.assertJSXOpeningFragment(openingFragment);

    const closingFragment = this.places.get(instruction.closingFragment.id);
    if (closingFragment === undefined) {
      throw new Error(`Place ${instruction.closingFragment.id} not found`);
    }

    t.assertJSXClosingFragment(closingFragment);

    const children = instruction.children.map((child) => {
      const node = this.places.get(child.id);
      if (node === undefined) {
        throw new Error(`Place ${child.id} not found`);
      }

      assertJSXChild(node);
      return node;
    });

    const node = t.jsxFragment(openingFragment, closingFragment, children);
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateJSXText(instruction: JSXTextInstruction): t.JSXText {
    const node = t.jsxText(instruction.value);
    this.places.set(instruction.place.id, node);
    return node;
  }

  /******************************************************************************
   * Misc Node Generation
   *
   * Methods for generating code from miscellaneous node types like holes and spread
   ******************************************************************************/

  #generateMiscellaneousNode(
    instruction: MiscellaneousInstruction,
  ): t.Node | null {
    if (instruction instanceof HoleInstruction) {
      return this.#generateHole(instruction);
    } else if (instruction instanceof ObjectMethodInstruction) {
      return this.#generateObjectMethod(instruction);
    } else if (instruction instanceof ObjectPropertyInstruction) {
      return this.#generateObjectProperty(instruction);
    } else if (instruction instanceof SpreadElementInstruction) {
      return this.#generateSpreadElement(instruction);
    } else if (instruction instanceof ImportSpecifierInstruction) {
      return this.#generateImportSpecifier(instruction);
    }

    throw new Error(
      `Unsupported miscellaneous node type: ${instruction.constructor.name}`,
    );
  }

  #generateHole(instruction: HoleInstruction): null {
    const node = null;
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateObjectMethod(instruction: ObjectMethodInstruction): t.ObjectMethod {
    const key = this.places.get(instruction.key.id);
    if (key === undefined) {
      throw new Error(`Place ${instruction.key.id} not found`);
    }

    t.assertExpression(key);

    const params = instruction.params.map((param) => {
      // Since this is the first time we're using param, it does not exist in the
      // places map. We need to create a new identifier for it.
      const identifier = t.identifier(param.identifier.name);
      this.places.set(param.id, identifier);
      return identifier;
    });

    const body = this.#generateBlock(instruction.body);
    const node = t.objectMethod(
      instruction.kind,
      key,
      params,
      t.blockStatement(body),
      instruction.computed,
      instruction.generator,
      instruction.async,
    );
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateObjectProperty(
    instruction: ObjectPropertyInstruction,
  ): t.ObjectProperty {
    const key = this.places.get(instruction.key.id);
    if (key === undefined) {
      throw new Error(`Place ${instruction.key.id} not found`);
    }

    const value = this.places.get(instruction.value.id);
    if (value === undefined) {
      throw new Error(`Place ${instruction.value.id} not found`);
    }

    t.assertExpression(key);
    t.assertExpression(value);

    const node = t.objectProperty(key, value);
    this.places.set(instruction.place.id, node);
    return node;
  }

  #generateSpreadElement(
    instruction: SpreadElementInstruction,
  ): t.SpreadElement {
    const argument = this.places.get(instruction.argument.id);
    if (argument === undefined) {
      throw new Error(`Place ${instruction.argument.id} not found`);
    }

    t.assertExpression(argument);
    const node = t.spreadElement(argument);
    this.places.set(instruction.place.id, node);
    return node;
  }

  /******************************************************************************
   * Utils
   *
   * Utility methods used by the code generator
   ******************************************************************************/

  #lookupPlace(
    place: Place,
    isVariableDeclaratorId: boolean = false,
  ): t.Node | null {
    const node = this.places.get(place.id);
    if (node === undefined) {
      if (isVariableDeclaratorId) {
        return t.identifier(place.identifier.name);
      }

      throw new Error(`Place ${place.id} not found`);
    }

    return node;
  }

  #assertNonNull<T>(value: T | undefined | null): asserts value is T {}
}
