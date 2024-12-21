"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionInliner = void 0;
exports.functionInlining = functionInlining;
const Identifier_1 = require("../../HIR/Identifier");
const CallGraph_1 = require("./CallGraph");
function functionInlining(blocks) {
    new FunctionInliner(blocks).optimize();
}
class FunctionInliner {
    #blocks;
    #nextIdentifierId = 0;
    #callGraph;
    constructor(blocks) {
        this.#blocks = blocks;
        this.#callGraph = CallGraph_1.CallGraph.fromBlocks(blocks);
    }
    optimize() {
        this.#inlineEligibleFunctions();
    }
    #inlineEligibleFunctions() {
        for (const block of [...this.#blocks.values()].reverse()) {
            this.#inlineFunctionsInBlock(block);
        }
    }
    #inlineFunctionsInBlock(block) {
        for (const [index, instruction] of block.instructions.entries()) {
            if (!this.#isInlineable(instruction)) {
                continue;
            }
            const targetFunction = this.#callGraph
                .getFunctionDeclarations()
                .get(instruction.callee.identifier.id);
            if (!targetFunction) {
                continue;
            }
            const inlinedCode = this.#inlineFunction(instruction, targetFunction);
            block.instructions.splice(index, 1, ...inlinedCode);
        }
    }
    #isInlineable(instruction) {
        if (instruction.kind !== "CallExpression") {
            return false;
        }
        const callee = instruction.callee.identifier.id;
        return !this.#callGraph.isFunctionRecursive(callee);
    }
    #generateUniquePlace(originalPlace) {
        const id = this.#nextIdentifierId++;
        return {
            kind: "Identifier",
            identifier: {
                id: (0, Identifier_1.makeIdentifierId)(id),
                name: `$inline${id}`,
                declarationId: originalPlace.identifier.declarationId,
            },
        };
    }
    #inlineFunction(call, targetFunction) {
        const functionBody = this.#blocks.get(targetFunction.body);
        if (!functionBody) {
            return [call];
        }
        const { paramMap, localVarMap } = this.#buildVariableMaps(call, targetFunction);
        return this.#transformInstructions(functionBody, paramMap, localVarMap, call);
    }
    #buildVariableMaps(call, targetFunction) {
        const paramMap = new Map();
        const localVarMap = new Map();
        targetFunction.params.forEach((param, index) => {
            const arg = call.args[index];
            if (arg && arg.kind !== "SpreadElement") {
                paramMap.set(param.identifier.id, arg);
            }
        });
        return { paramMap, localVarMap };
    }
    #transformInstructions(functionBody, paramMap, localVarMap, call) {
        const transformed = [];
        for (const instruction of functionBody.instructions) {
            if (instruction.kind === "FunctionDeclaration") {
                continue;
            }
            const newPlace = this.#generateUniquePlace(instruction.target);
            localVarMap.set(instruction.target.identifier.id, newPlace);
            transformed.push(this.#remapVariables(instruction, paramMap, localVarMap));
        }
        return this.#mapReturnValue(transformed, call);
    }
    #remapVariables(instruction, paramMap, localVarMap) {
        return instruction.cloneWithPlaces(new Map([...paramMap, ...localVarMap]));
    }
    #mapReturnValue(instructions, call) {
        const lastInstruction = instructions[instructions.length - 1];
        if (!lastInstruction) {
            return instructions;
        }
        const finalMapping = new Map([
            [lastInstruction.target.identifier.id, call.target],
        ]);
        instructions[instructions.length - 1] =
            lastInstruction.cloneWithPlaces(finalMapping);
        return instructions;
    }
}
exports.FunctionInliner = FunctionInliner;
