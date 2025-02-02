import { HelperModule, LogModule, TruncationModule, WindowModule } from "./utils";
import { InterfaceModule } from "./interface";
import { CryptoModule } from "./crypto";
import { PrefsModule } from "./prefs";

export type SypherNamespace =
    typeof PrefsModule
    & typeof CryptoModule
    & typeof HelperModule
    & typeof LogModule
    & typeof InterfaceModule
    & typeof TruncationModule
    & typeof WindowModule;

(function (global: any) {
    const sypher: SypherNamespace = {
        ...PrefsModule,
        ...CryptoModule,
        ...HelperModule,
        ...LogModule,
        ...InterfaceModule,
        ...TruncationModule,
        ...WindowModule,
    };
    
    global.sypher = sypher;
    console.log("Sypher Modules Initialized");
})(window);