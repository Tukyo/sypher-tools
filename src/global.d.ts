import { SypherNamespace } from "./index";

declare global { const sypher: SypherNamespace; const ethers: typeof import("ethers"); }