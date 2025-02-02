import { TElementParams } from "./interface.d";
import { TPAccountView } from "./prefabs.d";

export function PAccountView(params: TPAccountView): TElementParams {
    return {
        append: params.modalObj.body,
        type: "div",
        id: "account-view",
        children: [
            { // Header
                type: "div",
                classes: ["av-h"],
                children: [
                    {
                        type: "h2",
                        classes: ["av-h-ti"],
                        innerHTML: params.ens ? `${sypher.truncate(params.ens)}` : `${sypher.truncate(params.account)}`
                    },
                    {
                        type: "h3",
                        classes: ["av-h-ba"],
                        innerHTML: `${sypher.truncateBalance(parseFloat(params.ethBalance.toString()))} ETH` // TODO: Update 'ETH' to native token of chain
                    }
                ]
            },
            { // Body
                type: "div",
                classes: ["av-b"],
                children: [
                    {
                        type: "div",
                        id: "av-b-td",
                        classes: [params.tokenDetailClass],
                        children: [
                            {
                                type: "div",
                                classes: ["av-b-td-ic"],
                                children: [
                                    {
                                        type: "img",
                                        classes: ["av-b-td-i"],
                                        attributes: {
                                            src: params.icon
                                        }
                                    },
                                    {
                                        type: "div",
                                        classes: ["av-b-td-n"],
                                        innerHTML: params.showTokenDetails
                                            ? `$${sypher.truncateBalance(parseFloat(params.tokenPrice.toString()))}`
                                            : ""
                                    }
                                ]
                            },
                            {
                                type: "div",
                                classes: ["av-b-td-bal"],
                                innerHTML: params.showTokenDetails
                                    ? `${sypher.truncateBalance(parseFloat(params.userBalance.toString()))} ${params.tokenName}`
                                    : ""
                            },
                            {
                                type: "div",
                                classes: ["av-b-td-val"],
                                innerHTML: params.showTokenDetails
                                    ? `$${sypher.truncateBalance(parseFloat(params.userValue.toString()))}`
                                    : ""
                            }
                        ]
                    },
                    {
                        type: "div",
                        id: "av-b-provider",
                        classes: ["av-b-b"],
                        events: {
                            click: () => {
                                const accountView = document.getElementById("account-view");
                                if (accountView) {
                                    accountView.style.display = "none";
                                }

                                const buttons = document.querySelectorAll(".connect-mi");
                                buttons.forEach(button => {
                                    (button as HTMLDivElement).style.display = "flex";
                                });

                                params.modalObj.title.innerHTML = "Change Wallet";
                            }
                        },
                        children: [
                            {
                                type: "div",
                                classes: ["av-b-bn-ic"],
                                children: [
                                    {
                                        type: "img",
                                        classes: ["av-b-bn-i"],
                                        attributes: {
                                            src: params.mergedProviders[0].info.icon
                                        }
                                    },
                                    {
                                        type: "img",
                                        classes: ["av-b-bn-i"],
                                        attributes: {
                                            src: params.mergedProviders[1].info.icon
                                        }
                                    }
                                ]
                            },
                            {
                                type: "div",
                                classes: ["av-b-bn-t"],
                                innerHTML: "Change Wallet"
                            }
                        ]
                    }
                ]
            },
            { // Disconnect
                type: "div",
                classes: ["av-x"],
                events: {
                    click: () => {
                        sypher.disconnect();

                        const accountView = document.getElementById("account-view");
                        if (accountView && accountView.parentNode) {
                            accountView.parentNode.removeChild(accountView);
                        }

                        const buttons = document.querySelectorAll(".connect-mi");
                        buttons.forEach(button => {
                            (button as HTMLDivElement).style.display = "flex";
                        });

                        const connectButton = document.getElementById("connect-button");
                        if (connectButton && sypher._connectText) {
                            connectButton.innerHTML = sypher._connectText;
                        }

                        params.modalObj.title.innerHTML = "Connect Wallet";
                    }
                },
                innerHTML: "Disconnect"
            }
        ]
    };
}