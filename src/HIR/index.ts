export { BasicBlock, Block, ForLoopBlock } from "./Block";
export type { BlockId } from "./Block";
export type { DeclarationId } from "./Declaration";
export { HIRBuilder, type Bindings } from "./HIRBuilder";
export type { Identifier, IdentifierId } from "./Identifier";
export {
  StoreLocalInstruction,
  type ArrayExpressionInstruction,
  type AssignmentExpressionInstruction,
  type BinaryExpressionInstruction,
  type CallExpressionInstruction,
  type ExpressionInstruction,
  type ExpressionStatementInstruction,
  type FunctionDeclarationInstruction,
  type Instruction,
  type LiteralInstruction,
  type LoadLocalInstruction,
  type SpreadElementInstruction,
  type UnaryExpressionInstruction,
  type UnsupportedNodeInstruction,
} from "./Instruction";
export { NamedPlace as IdentifierPlace, Place, TemporaryPlace } from "./Place";
export {
  ForLoopTerminal,
  IfTerminal,
  JumpTerminal,
  ReturnTerminal,
  WhileLoopTerminal,
  type Terminal,
} from "./Terminal";
export type { Value } from "./Value";
