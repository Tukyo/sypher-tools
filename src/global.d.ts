import { TEthereumProvider } from "./crypto.d";
import { SypherNamespace } from "./index";

declare global {
    var sypher: SypherNamespace;
    var ethers: any;
    interface Window {
        ethereum?: any;
    }
}