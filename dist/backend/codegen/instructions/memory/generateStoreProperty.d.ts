import * as t from "@babel/types";
import { StorePropertyInstruction } from "../../../../ir/instructions/memory/StoreProperty";
import { CodeGenerator } from "../../../CodeGenerator";
/**
 * Generates the Babel AST for storing a value into an object property:
 * `object[property] = value`.
 *
 * We keep a separate `StorePropertyInstruction` (rather than reusing local
 * store instructions) because object property writes typically involve memory
 * and alias analysis that differs from local variable writes.
 */
export declare function generateStorePropertyInstruction(instruction: StorePropertyInstruction, generator: CodeGenerator): t.AssignmentExpression;
