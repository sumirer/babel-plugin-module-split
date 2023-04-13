import {PluginPass} from "@babel/core";
import {IModulesConfig, PluginConfig} from "../config/PluginConfig";
import {Declarations} from "../transfrom/Transform";

export interface PluginContext extends PluginPass{
    __moduleCache: Map<string, Declarations>;
    __pluginConfig: PluginConfig;
    opts: {
        modules?: Array<IModulesConfig>;
        alias?: Record<string, string>
    }
}
