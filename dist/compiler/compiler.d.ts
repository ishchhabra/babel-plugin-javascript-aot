import { PluginOptions as BabelPluginOptions, NodePath } from "@babel/core";
import { Program } from "@babel/types";
export declare class Compiler {
    compileProgram(program: NodePath<Program>, pluginOptions: BabelPluginOptions): Program;
}
