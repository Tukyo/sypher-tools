import { TElementParams } from "./interface.d";
import { TPAccountView, TPBranding } from "./prefabs.d";

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
                        innerHTML: params.user.ens ? `${sypher.truncate(params.user.ens)}` : `${sypher.truncate(params.user.account)}`,
                        attributes: {
                            "s-data": `${params.user.account}`
                        }
                    },
                    {
                        type: "div",
                        classes: ["av-h-ch-c"],
                        children: [
                            {
                                type: "img",
                                classes: ["av-h-ch-i"],
                                attributes: {
                                    src: `https://ipfs.io/ipfs/${params.chain.icon[0].url.replace("ipfs://", "")}`
                                }
                            },
                            {
                                type: "img",
                                classes: ["av-h-ch-ar"],
                                attributes: {
                                    src: 'https://raw.githubusercontent.com/leungwensen/svg-icon/8b84d725b0d2be8f5d87cac7f2c386682ce43563/dist/svg/zero/arrow-down-l.svg'
                                }
                            },
                        ]
                    },
                    {
                        type: "h2",
                        classes: ["av-h-ba"],
                        innerHTML: `${sypher.truncateBalance(parseFloat(params.user.ethBalance.toString()))} ${params.chain.nativeCurrency.symbol}`,
                        attributes: {
                            "s-data": `${params.user.ethBalance}`
                        }
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
                        classes: [params.token.tokenDetailClass],
                        children: [
                            {
                                type: "div",
                                classes: ["av-b-td-ic"],
                                children: [
                                    {
                                        type: "img",
                                        classes: ["av-b-td-i"],
                                        attributes: {
                                            src: params.token.icon
                                        }
                                    },
                                    {
                                        type: "div",
                                        classes: ["av-b-td-n"],
                                        innerHTML: params.token.showTokenDetails
                                            ? `$${sypher.truncateBalance(parseFloat(params.token.tokenPrice.toString()), params.token.tokenDecimals)}`
                                            : ""
                                    }
                                ],
                                attributes: {
                                    "s-data": `${params.token.address}`
                                }
                            },
                            {
                                type: "div",
                                classes: ["av-b-td-bc"],
                                children: [
                                    {
                                        type: "div",
                                        classes: ["av-b-td-bal"],
                                        innerHTML: params.token.showTokenDetails
                                            ? `${sypher.truncateBalance(parseFloat(params.token.userBalance.toString()))} ${params.token.tokenSymbol}`
                                            : "",
                                        attributes: {
                                            "s-data": `${params.token.userBalance}`
                                        }
                                    },
                                    {
                                        type: "div",
                                        classes: ["av-b-td-val"],
                                        innerHTML: params.token.showTokenDetails
                                            ? `$${sypher.truncateBalance(parseFloat(params.token.userValue.toString()))}`
                                            : "",
                                        attributes: {
                                            "s-data": `${sypher.truncateBalance(parseFloat(params.token.userValue.toString()))}`
                                        }
                                    }
                                ]
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

                                let providerName = "";
                                const providerDetail = sypher.getProviderDetail();
                                if (providerDetail) {
                                    providerName = providerDetail.info.name.replace(/\s+/g, '').toLowerCase();
                                }

                                const buttons = document.querySelectorAll(".connect-mi");
                                buttons.forEach(button => {
                                    const buttonElement = button as HTMLDivElement;
                                    if (buttonElement.id.replace(/[\s-]+/g, '').toLowerCase() === providerName) {
                                        buttonElement.style.display = "none";
                                    } else {
                                        buttonElement.style.display = "flex";
                                    }
                                });

                                const modalBody = document.getElementById("connect-mb");
                                if (modalBody) {
                                    modalBody.style.padding = "15px";
                                }

                                params.modalObj.title.innerHTML = "Change Wallet";

                                if (providerDetail) {
                                    const providerContainer = document.getElementById("current-provider-container");
                                    if (providerContainer) {
                                        const providerName = document.getElementById("current-provider-name");
                                        const providerIcon = document.getElementById("current-provider-icon");

                                        if (providerName) {
                                            providerName.innerHTML = providerDetail.info.name;
                                        }
                                        if (providerIcon) {
                                            providerIcon.setAttribute("src", providerDetail.info.icon);
                                        }

                                        providerContainer.style.display = "flex";

                                        providerContainer.onclick = () => {
                                            if (accountView) {
                                                accountView.style.display = "flex";
                                            }

                                            buttons.forEach(button => {
                                                (button as HTMLDivElement).style.display = "none";
                                            });

                                            if (modalBody) {
                                                modalBody.style.padding = "0px";
                                            }

                                            params.modalObj.title.innerHTML = "Account";

                                            providerContainer.style.display = "none";
                                        };
                                    }
                                }
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
};

export function PBranding(params: TPBranding): TElementParams {
    return {
        append: params.modalObj.parent,
        type: "div",
        classes: ["sypher-connect-brand"],
        children: [
            {
                type: "p",
                classes: ["sypher-connect-brand-text"],
                innerHTML: "Powered by"
            },
            {
                type: "div",
                classes: ["sypher-connect-brand-logo-container"],
                events: { click: () => window.open("https://sypher.tools", "_blank") },
                children: [
                    {
                        type: "div",
                        classes: ["sypher-connect-brand-logo"],
                        innerHTML: `
                            <svg id="sypher-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 105.87 120.22">
                                <g id="Layer_2" data-name="Layer 2">
                                    <g id="svg1">
                                        <g id="layer1">
                                            <g id="g28">
                                                <path id="path18-6-3" class="cls-1"
                                                    d="M15.16,0h7V16.56H42.35V0h7V16.56h52.22l2.3,2.54q-5,20.15-15.54,34.48a83.94,83.94,0,0,1-18,17.81h30l4.19,3.72A117.92,117.92,0,0,1,86.24,95.7l-5.07-4.62a100.71,100.71,0,0,0,13-13.1H80.54l-.07,7.41q0,12.7-4.19,20.5a43,43,0,0,1-12.32,14l-5.2-5.23a33,33,0,0,0,11.59-12q3.77-7,3.76-17.24L74,78H55.62V71.39A77.14,77.14,0,0,0,81.19,51.5a70.26,70.26,0,0,0,14.18-28H80.46C80,25.78,77.65,35.39,66.37,49.46A193.42,193.42,0,0,1,47.31,68.51v41.68h-7V74.26Q26,85,15.17,89.2l-3.93-6.43Q36.8,73.55,61,44.84s11.5-14.36,11.39-21.32H64.51v0H49.35v12.7a28.57,28.57,0,0,1-5.9,17A36,36,0,0,1,26.89,65.61l-4.43-6.88Q31.84,56.35,37.1,50a21.06,21.06,0,0,0,5.25-13.57V23.56H22.16V40.27h-7V23.56H0v-7H15.16ZM76.61,113.11l29,.12.27,7-29-.12Z" />
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </svg>`
                    }
                ]
            }
        ]
    }
};