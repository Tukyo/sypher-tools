import { SypherNamespace } from ".";

export type TPAccountView = {
    modalObj: { body: HTMLElement; title: HTMLElement },
    ens: string | undefined,
    account: string,
    sypher: SypherNamespace,
    ethBalance: number,
    tokenDetailClass: string,
    icon: string,
    showTokenDetails: boolean,
    tokenPrice: number,
    userBalance: number,
    tokenName: string,
    userValue: string,
    mergedProviders: { info: { icon: string } }[]
}