import { Environment } from "../environment";
import { InstructionId, makeInstructionId } from "./base/Instruction";
import { BasicBlock, makeBlockId } from "./core/Block";
import { FunctionIR, makeFunctionIRId } from "./core/FunctionIR";
import {
  DeclarationId,
  Identifier,
  makeDeclarationId,
  makeIdentifierId,
} from "./core/Identifier";
import { makePlaceId, Place } from "./core/Place";

export function createPlace(
  identifier: Identifier,
  environment: Environment,
): Place {
  const placeId = makePlaceId(environment.nextPlaceId++);
  return new Place(placeId, identifier);
}

export function createIdentifier(
  environment: Environment,
  declarationId?: DeclarationId,
): Identifier {
  declarationId ??= makeDeclarationId(environment.nextDeclarationId++);

  const identfierId = makeIdentifierId(environment.nextIdentifierId++);
  const version = environment.declToPlaces.get(declarationId)?.length ?? 0;
  return new Identifier(identfierId, `${version}`, declarationId);
}

export function createBlock(environment: Environment): BasicBlock {
  const blockId = makeBlockId(environment.nextBlockId++);
  return new BasicBlock(blockId, [], undefined);
}

export function createFunction(environment: Environment): FunctionIR {
  const functionId = makeFunctionIRId(environment.nextFunctionId++);
  return new FunctionIR(functionId, new Map());
}

export function createInstructionId(environment: Environment): InstructionId {
  return makeInstructionId(environment.nextInstructionId++);
}
