import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { getFunctionName } from "../../../babel-utils";
import {
  createBlock,
  createInstructionId,
  FunctionDeclarationInstruction,
  JumpTerminal,
} from "../../../ir";
import { buildBindings } from "../bindings/buildBindings";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildFunctionDeclaration(
  nodePath: NodePath<t.FunctionDeclaration>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
) {
  const currentBlock = functionBuilder.currentBlock;

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

  const functionName = getFunctionName(nodePath);
  if (functionName === null) {
    throw new Error("Invalid function declaration");
  }

  const declarationId = functionBuilder.getDeclarationId(
    functionName.node.name,
    nodePath,
  );
  if (declarationId === undefined) {
    throw new Error(
      `Function accessed before declaration: ${functionName.node.name}`,
    );
  }

  const functionPlace =
    functionBuilder.getLatestDeclarationPlace(declarationId);
  if (functionPlace === undefined) {
    throw new Error(
      `Unable to find the place for ${functionName.node.name} (${declarationId})`,
    );
  }

  currentBlock.instructions.push(
    new FunctionDeclarationInstruction(
      createInstructionId(functionBuilder.environment),
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
    createInstructionId(functionBuilder.environment),
    bodyBlock.id,
  );

  functionBuilder.currentBlock = currentBlock;
  return functionPlace;
}
