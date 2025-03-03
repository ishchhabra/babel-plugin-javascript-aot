import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import {
  BindingIdentifierInstruction,
  BranchTerminal,
  createInstructionId,
  JumpTerminal,
  LiteralInstruction,
  Place,
  StoreLocalInstruction,
} from "../../../ir";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
import { buildNode } from "../buildNode";

/**
 * Builds a place for a conditional expression.
 *
 * Lowers a conditional expression `test ? consequent : alternate` into an
 * if statement, with a temporary variable to store the result of the
 * conditional expression.
 *
 * @param nodePath - The Babel NodePath for the conditional expression
 * @param functionBuilder - The FunctionIRBuilder managing IR state
 * @param moduleBuilder - The ModuleIRBuilder managing IR state
 * @param environment - The environment managing IR state
 *
 * @returns The `Place` referencing the temporary variable that stores the
 * result of the conditional expression
 */
export function buildConditionalExpression(
  nodePath: NodePath<t.ConditionalExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place {
  const testPath = nodePath.get("test");
  const testPlace = buildNode(
    testPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (testPlace === undefined || Array.isArray(testPlace)) {
    throw new Error("Conditional expression test must be a single place");
  }

  const currentBlock = functionBuilder.currentBlock;
  // When lowering a conditional expression to an if statement, we need to
  // create a temporary identifier to store the result of the conditional
  // expression in case it is used as value somewhere (ex: in a StoreLocal).
  const resultPlace = buildTemporaryIdentifier(
    nodePath,
    functionBuilder,
    environment,
  );

  // Create the join block.
  const joinBlock = environment.createBlock();
  functionBuilder.blocks.set(joinBlock.id, joinBlock);

  // Build the consequent block.
  const consequentPath = nodePath.get("consequent");
  const consequentBlock = environment.createBlock();
  functionBuilder.blocks.set(consequentBlock.id, consequentBlock);

  functionBuilder.currentBlock = consequentBlock;
  buildBranchExpression(
    consequentPath,
    functionBuilder,
    moduleBuilder,
    environment,
    resultPlace,
  );

  // After building the consequent block, we need to set the terminal
  // from the last block to the join block.
  functionBuilder.currentBlock.terminal = new JumpTerminal(
    createInstructionId(functionBuilder.environment),
    joinBlock.id,
  );

  // Build the alternate block.
  const alternatePath = nodePath.get("alternate");
  const alternateBlock = environment.createBlock();
  functionBuilder.blocks.set(alternateBlock.id, alternateBlock);

  functionBuilder.currentBlock = alternateBlock;
  buildBranchExpression(
    alternatePath,
    functionBuilder,
    moduleBuilder,
    environment,
    resultPlace,
  );

  // After building the alternate block, we need to set the terminal
  // from the last block to the join block.
  functionBuilder.currentBlock.terminal = new JumpTerminal(
    createInstructionId(functionBuilder.environment),
    joinBlock.id,
  );

  // Set the branch terminal for the current block.
  currentBlock.terminal = new BranchTerminal(
    createInstructionId(functionBuilder.environment),
    testPlace,
    consequentBlock.id,
    alternateBlock.id,
    joinBlock.id,
  );

  functionBuilder.currentBlock = joinBlock;

  const { placeId } = environment.getLatestDeclaration(
    resultPlace.identifier.declarationId,
  );
  return environment.places.get(placeId)!;
}

function buildTemporaryIdentifier(
  nodePath: NodePath<t.ConditionalExpression>,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
) {
  const bindingIdentifier = environment.createIdentifier();
  const bindingPlace = environment.createPlace(bindingIdentifier);
  functionBuilder.addInstruction(
    environment.createInstruction(
      BindingIdentifierInstruction,
      bindingPlace,
      nodePath,
      bindingIdentifier.name,
    ),
  );
  functionBuilder.registerDeclarationName(
    bindingIdentifier.name,
    bindingIdentifier.declarationId,
    nodePath,
  );
  environment.registerDeclaration(
    bindingIdentifier.declarationId,
    functionBuilder.currentBlock.id,
    bindingPlace.id,
  );

  const resultValueIdentifier = environment.createIdentifier(
    bindingIdentifier.declarationId,
  );
  const resultValuePlace = environment.createPlace(resultValueIdentifier);
  functionBuilder.addInstruction(
    environment.createInstruction(
      LiteralInstruction,
      resultValuePlace,
      nodePath,
      undefined,
    ),
  );

  const resultIdentifier = environment.createIdentifier(
    bindingIdentifier.declarationId,
  );
  const resultPlace = environment.createPlace(resultIdentifier);
  functionBuilder.addInstruction(
    environment.createInstruction(
      StoreLocalInstruction,
      resultPlace,
      nodePath,
      bindingPlace,
      resultValuePlace,
      "const",
    ),
  );

  return bindingPlace;
}

function buildBranchExpression(
  nodePath: NodePath<t.Expression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
  resultPlace: Place,
) {
  const place = buildNode(
    nodePath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (place === undefined || Array.isArray(place)) {
    throw new Error("Conditional expression consequent must be a single place");
  }

  const lvalIdentifier = environment.createIdentifier(
    resultPlace.identifier.declarationId,
  );
  const lvalPlace = environment.createPlace(lvalIdentifier);
  const lvalInstruction = environment.createInstruction(
    BindingIdentifierInstruction,
    lvalPlace,
    nodePath,
    lvalIdentifier.name,
  );
  functionBuilder.addInstruction(lvalInstruction);
  environment.registerDeclaration(
    lvalIdentifier.declarationId,
    functionBuilder.currentBlock.id,
    lvalPlace.id,
  );

  const storeIdentifier = environment.createIdentifier(
    lvalIdentifier.declarationId,
  );
  const storePlace = environment.createPlace(storeIdentifier);
  const storeInstruction = environment.createInstruction(
    StoreLocalInstruction,
    storePlace,
    nodePath,
    lvalPlace,
    place,
    "const",
  );
  functionBuilder.addInstruction(storeInstruction);

  return place;
}
