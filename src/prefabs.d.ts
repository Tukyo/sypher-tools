import { SypherNamespace } from ".";

export type TPAccountView = {
    sypher: SypherNamespace,
    modalObj: { body: HTMLElement; title: HTMLElement },
    mergedProviders: { info: { icon: string } }[],
    user: {
        ens: string | undefined,
        account: string,
        ethBalance: number,
    },
    token: {
        tokenDetailClass: string,
        showTokenDetails: boolean,
        address: string,
        icon: string,
        tokenPrice: number,
        userBalance: number,
        tokenSymbol: string,
        userValue: string,
        tokenDecimals: number,
    },
    chain: {
        name: string,
        icon: [{
            url: string
        }],
        nativeCurrency: {
            symbol: string,
            decimals: number
        },
        explorers: [{
            name: string,
            url: string,
            icon: string
        }]
    }
}

export type TPBranding = {
    modalObj: { parent: HTMLElement },
}