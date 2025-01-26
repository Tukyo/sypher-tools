import { IChainConfig, TProviderDetail } from "./crypto.d";

export const ADDRESS_REGEXP: RegExp = /^0x[a-fA-F0-9]{40}$/;
export const LP_VER: string[] = ["V2", "V3"];

export const CHAINS: Record<string, IChainConfig> = {
    ethereum: {
        params: [{ chainId: "0x1" }],
        priceFeeds: {
            eth: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
        },
        pairAddresses: {
            eth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        }
    },
    arbitrum: {
        params: [{ chainId: "0xa4b1" }],
        priceFeeds: {
            eth: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
            arb: "0xb2A824043730FE05F3DA2efaFa1CBbe83fa548D6"
        },
        pairAddresses: {
            eth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            arb: "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1"
        }
    },
    optimism: {
        params: [{ chainId: "0xa" }],
        priceFeeds: {
            eth: "0xb7B9A39CC63f856b90B364911CC324dC46aC1770",
            op: "0x0D276FC14719f9292D5C1eA2198673d1f4269246"
        },
        pairAddresses: {
            eth: "0x4200000000000000000000000000000000000006",
            op: "0x4200000000000000000000000000000000000042"
        }
    },
    base: {
        params: [{ chainId: "0x2105" }],
        priceFeeds: {
            eth: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70"
        },
        pairAddresses: {
            eth: "0x4200000000000000000000000000000000000006"
        }
    },
    polygon: {
        params: [{ chainId: "0x89" }],
        priceFeeds: {
            eth: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
            matic: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0"
        },
        pairAddresses: {
            eth: "0x11CD37bb86F65419713f30673A480EA33c826872",
            matic: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"
        }
    },
    avalanche: {
        params: [{ chainId: "0xa86a" }],
        priceFeeds: {
            eth: "0x976B3D034E162d8bD72D6b9C989d545b839003b0",
            avax: "0x0A77230d17318075983913bC2145DB16C7366156"
        },
        pairAddresses: {
            eth: "",
            avax: ""
        }
    },
    fantom: {
        params: [{ chainId: "0xfa" }],
        priceFeeds: {
            eth: "0x11DdD3d147E5b83D01cee7070027092397d63658",
            ftm: "0xf4766552D15AE4d256Ad41B6cf2933482B0680dc"
        },
        pairAddresses: {
            eth: "",
            ftm: ""
        }
    }
};
export const DISCOVERED_PROVIDERS: TProviderDetail[] = [];

export const CHAINLINK_ABI: string[] = [
    "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
];
export const ERC20_ABI: string[] = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
];
export const UNISWAP_V2_POOL_ABI: string[] = [
    "function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)",
    "function token0() view returns (address)",
    "function token1() view returns (address)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 value) returns (bool)",
    "function transfer(address to, uint256 value) returns (bool)",
    "function transferFrom(address from, address to, uint256 value) returns (bool)"
];
export const UNISWAP_V3_POOL_ABI: string[] = [
    "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
    "function token0() view returns (address)",
    "function token1() view returns (address)",
    "function fee() view returns (uint24)",
    "function decimals() view returns (uint8)",
    "function liquidity() view returns (uint128)"
];