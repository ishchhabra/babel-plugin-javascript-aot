import * as t from "@babel/types";
import { StoreDynamicPropertyInstruction } from "../../../../ir/instructions/memory/StoreComputedProperty";
import { CodeGenerator } from "../../../CodeGenerator";
/**
 * Generates the Babel AST for storing a value into a dynamic object property:
 * `object[property] = value`.
 *
 * We keep a separate `StoreDynamicPropertyInstruction` (rather than reusing local
 * store instructions) because dynamic property writes typically involve memory
 * and alias analysis that differs from local variable writes.
 */
export declare function generateStoreDynamicPropertyInstruction(instruction: StoreDynamicPropertyInstruction, generator: CodeGenerator): t.AssignmentExpression;
