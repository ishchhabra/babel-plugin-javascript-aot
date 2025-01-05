import { Environment } from "../compiler";
import { BasicBlock } from "./Block";
import { DeclarationId, Identifier } from "./Identifier";
import { Place } from "./Place";
export declare function createPlace(identifier: Identifier, environment: Environment): Place;
export declare function createIdentifier(environment: Environment, declarationId?: DeclarationId): Identifier;
export declare function createBlock(environment: Environment): BasicBlock;
