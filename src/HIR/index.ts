export { BasicBlock, Block, ForLoopBlock, LoopBlock } from "./Block";
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
  type UnaryExpressionInstruction,
  type UnsupportedNodeInstruction,
} from "./Instruction";
export { NamedPlace as IdentifierPlace, Place, TemporaryPlace } from "./Place";
export type { Terminal } from "./Terminal";
export type { Value } from "./Value";
