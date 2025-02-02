import { HelperModule, LogModule, TruncationModule, WindowModule } from "./utils";
import { InterfaceModule } from "./interface";
import { CryptoModule } from "./crypto";
import { PrefsModule } from "./prefs";

export const version = "1.0.0";
export const website = "https://sypher.tools";
export const repo = "https://github.com/Tukyo/sypher-tools";

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

    const info = console.info.bind(console);
    const styles = [
        "color: #fff",
        "background: linear-gradient(45deg, #ff0066, #6600ff)",
        "font-size: 12px",
        "font-weight: bold",
        "padding: 5px 10px",
        "border-radius: 5px",
        "text-shadow: 1px 1px 3px rgba(0,0,0,0.3)"
    ].join(";");
    function brandLog() {
        console.groupCollapsed("%cSypher Initialized", styles);
        info(`🔗 Website: ${website}`);
        info(`📖 Repo: ${repo}`);
        info(`⚙️ Version: ${version}`);
        console.groupEnd();
    }
    setTimeout(brandLog, 0);
})(window);