import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { getFunctionName } from "../../../babel-utils";
import {
  createBlock,
  FunctionDeclarationInstruction,
  JumpTerminal,
  makeInstructionId,
} from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildBindings } from "../bindings/buildBindings";
import { buildNode } from "../buildNode";

export function buildFunctionDeclaration(
  nodePath: NodePath<t.FunctionDeclaration>,
  builder: HIRBuilder,
) {
  const currentBlock = builder.currentBlock;

  // Build the body block.
  const bodyBlock = createBlock(builder.environment);
  builder.blocks.set(bodyBlock.id, bodyBlock);

  builder.currentBlock = bodyBlock;
  buildBindings(nodePath, builder);

  const params = nodePath.get("params");
  const paramPlaces = params.map((param) => {
    if (!param.isIdentifier()) {
      throw new Error(`Unsupported parameter type: ${param.type}`);
    }

    const declarationId = builder.getDeclarationId(param.node.name, nodePath);
    if (declarationId === undefined) {
      throw new Error(
        `Variable accessed before declaration: ${param.node.name}`,
      );
    }

    const place = builder.getLatestDeclarationPlace(declarationId);
    if (place === undefined) {
      throw new Error(`Unable to find the place for ${param.node.name}`);
    }

    return place;
  });

  const bodyPath = nodePath.get("body");
  builder.currentBlock = bodyBlock;
  buildNode(bodyPath, builder);

  const functionName = getFunctionName(nodePath);
  if (functionName === null) {
    throw new Error("Invalid function declaration");
  }

  const declarationId = builder.getDeclarationId(
    functionName.node.name,
    nodePath,
  );
  if (declarationId === undefined) {
    throw new Error(
      `Function accessed before declaration: ${functionName.node.name}`,
    );
  }

  const functionPlace = builder.getLatestDeclarationPlace(declarationId);
  if (functionPlace === undefined) {
    throw new Error(
      `Unable to find the place for ${functionName.node.name} (${declarationId})`,
    );
  }

  currentBlock.instructions.push(
    new FunctionDeclarationInstruction(
      makeInstructionId(builder.environment.nextInstructionId++),
      functionPlace,
      nodePath,
      paramPlaces,
      bodyBlock.id,
      nodePath.node.generator,
      nodePath.node.async,
    ),
  );

  // Set the terminal for the current block.
  currentBlock.terminal = new JumpTerminal(
    makeInstructionId(builder.environment.nextInstructionId++),
    bodyBlock.id,
  );

  builder.currentBlock = currentBlock;
  return functionPlace;
}
