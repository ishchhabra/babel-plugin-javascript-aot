import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createBlock,
  createIdentifier,
  createPlace,
  JumpTerminal,
  makeInstructionId,
  ObjectMethodInstruction,
  Place,
} from "../../ir";
import { buildBindings } from "./bindings/buildBindings";
import { buildNode } from "./buildNode";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
import { ModuleIRBuilder } from "./ModuleIRBuilder";

export function buildObjectMethod(
  nodePath: NodePath<t.ObjectMethod>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
): Place {
  const currentBlock = functionBuilder.currentBlock;

  // Build the key place
  const keyPath = nodePath.get("key");
  const keyPlace = buildNode(keyPath, functionBuilder, moduleBuilder);
  if (keyPlace === undefined) {
    throw new Error(`Unable to build key place for ${nodePath.type}`);
  }

  // Build the body block.
  const bodyBlock = createBlock(functionBuilder.environment);
  functionBuilder.blocks.set(bodyBlock.id, bodyBlock);

  functionBuilder.currentBlock = bodyBlock;
  buildBindings(nodePath, functionBuilder);

  const params = nodePath.get("params");
  const paramPlaces = params.map((param) => {
    if (!param.isIdentifier()) {
      throw new Error(`Unsupported parameter type: ${param.type}`);
    }

    const declarationId = functionBuilder.getDeclarationId(
      param.node.name,
      nodePath,
    );
    if (declarationId === undefined) {
      throw new Error(
        `Variable accessed before declaration: ${param.node.name}`,
      );
    }

    const place = functionBuilder.getLatestDeclarationPlace(declarationId);
    if (place === undefined) {
      throw new Error(`Unable to find the place for ${param.node.name}`);
    }

    return place;
  });

  const bodyPath = nodePath.get("body");
  functionBuilder.currentBlock = bodyBlock;
  buildNode(bodyPath, functionBuilder, moduleBuilder);

  const methodIdentifier = createIdentifier(functionBuilder.environment);
  const methodPlace = createPlace(
    methodIdentifier,
    functionBuilder.environment,
  );
  const methodInstructionId = makeInstructionId(
    functionBuilder.environment.nextInstructionId++,
  );

  currentBlock.instructions.push(
    new ObjectMethodInstruction(
      methodInstructionId,
      methodPlace,
      nodePath,
      keyPlace as Place,
      paramPlaces,
      bodyBlock.id,
      nodePath.node.computed,
      nodePath.node.generator,
      nodePath.node.async,
      nodePath.node.kind,
    ),
  );

  // Set the terminal for the current block.
  currentBlock.terminal = new JumpTerminal(
    makeInstructionId(functionBuilder.environment.nextInstructionId++),
    bodyBlock.id,
  );

  functionBuilder.currentBlock = currentBlock;
  return methodPlace;
}
