import * as t from "@babel/types";
import { StoreStaticPropertyInstruction } from "../../../../ir/instructions/memory/StoreStaticProperty";
import { CodeGenerator } from "../../../CodeGenerator";
/**
 * Generates the Babel AST for storing a value into an object property:
 * `object[property] = value`.
 *
 * We keep a separate `StoreStaticPropertyInstruction` (rather than reusing local
 * store instructions) because object property writes typically involve memory
 * and alias analysis that differs from local variable writes.
 */
export declare function generateStoreStaticPropertyInstruction(instruction: StoreStaticPropertyInstruction, generator: CodeGenerator): t.AssignmentExpression;
