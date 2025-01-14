import { Environment } from "../environment";
import { BasicBlock } from "./core/Block";
import { DeclarationId, Identifier } from "./core/Identifier";
import { Place } from "./core/Place";
export declare function createPlace(identifier: Identifier, environment: Environment): Place;
export declare function createIdentifier(environment: Environment, declarationId?: DeclarationId): Identifier;
export declare function createBlock(environment: Environment): BasicBlock;
