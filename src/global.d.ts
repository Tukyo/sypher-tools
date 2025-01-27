import { TEthereumProvider } from "./crypto.d";
import { SypherNamespace } from "./index";

declare global {
    var sypher: SypherNamespace;
    var ethers: typeof import("ethers");
    interface Window {
        ethereum?: any;
    }
}