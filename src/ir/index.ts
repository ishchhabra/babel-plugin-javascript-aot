export { BasicBlock, BlockId, makeBlockId } from "./Block";
export {
  DeclarationId,
  Identifier,
  IdentifierId,
  makeDeclarationId,
  makeIdentifierId,
  makeIdentifierName,
} from "./Identifier";
export {
  BaseInstruction,
  BinaryExpressionInstruction,
  ExpressionInstruction,
  ExpressionStatementInstruction,
  FunctionDeclarationInstruction,
  LiteralInstruction,
  LoadLocalInstruction,
  StatementInstruction,
  StoreLocalInstruction,
  UnaryExpressionInstruction,
  UnsupportedNodeInstruction,
  makeInstructionId,
} from "./Instruction";
export { Place, PlaceId, makePlaceId } from "./Place";
export {
  BaseTerminal,
  BranchTerminal,
  JumpTerminal,
  ReturnTerminal,
} from "./Terminal";
export { createBlock, createIdentifier, createPlace } from "./utils";
