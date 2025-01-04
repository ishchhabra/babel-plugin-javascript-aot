export { BasicBlock, makeBlockId } from "./Block";
export { Identifier, makeDeclarationId, makeIdentifierId, makeIdentifierName, } from "./Identifier";
export { ArrayExpressionInstruction, BaseInstruction, BinaryExpressionInstruction, CallExpressionInstruction, CopyInstruction, ExpressionInstruction, ExpressionStatementInstruction, FunctionDeclarationInstruction, HoleInstruction, LiteralInstruction, LoadGlobalInstruction, LoadLocalInstruction, MemberExpressionInstruction, MiscellaneousInstruction, SpreadElementInstruction, StatementInstruction, StoreLocalInstruction, UnaryExpressionInstruction, UnsupportedNodeInstruction, makeInstructionId, } from "./Instruction";
export { Place, makePlaceId } from "./Place";
export { BaseTerminal, BranchTerminal, JumpTerminal, ReturnTerminal, } from "./Terminal";
export { createBlock, createIdentifier, createPlace } from "./utils";
//# sourceMappingURL=index.js.map