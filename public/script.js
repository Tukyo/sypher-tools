// <reference path="defs.d.ts" />

const header = document.querySelector('header');



document.addEventListener("visibilitychange", sypher.pageFocus);
document.addEventListener('DOMContentLoaded', async function () {
    sypher.initTheme();
    const modal = sypher.createModal({ type: "log" });

    const connectButton = sypher.createButton(
        header,
        () => { toggleConnectModal() },
    );
});

function toggleConnectModal() {
    const connectModal = document.createElement('div');
    connectModal.classList.add('connect-modal');
    connectModal.id = 'connect-modal';

    const modalContainer = document.createElement('div');
    modalContainer.classList.add('connect-mc');
    modalContainer.id = 'connect-mc';

    const modalHeader = document.createElement('div');
    modalHeader.classList.add('connect-mh');
    modalHeader.id = 'connect-mh';

    const modalClose = document.createElement('img');
    modalClose.classList.add('connect-mx');
    modalClose.id = 'connect-mx';
    modalClose.src = "https://raw.githubusercontent.com/leungwensen/svg-icon/8b84d725b0d2be8f5d87cac7f2c386682ce43563/dist/svg/zero/close-c.svg";
    modalClose.addEventListener('click', () => { connectModal.remove() });

    const modalTitle = document.createElement('h2');
    modalTitle.classList.add('connect-mt');
    modalTitle.id = 'connect-mt';
    modalTitle.innerText = "Connect Wallet";

    const modalBody = document.createElement('div');
    modalBody.classList.add('connect-mb');
    modalBody.id = 'connect-mb';

    document.body.appendChild(connectModal);
    connectModal.appendChild(modalContainer);
    modalContainer.appendChild(modalHeader);
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(modalClose);
    modalContainer.appendChild(modalBody);

    discoveredProviders.forEach((providerDetail) => {
        const { name, icon } = providerDetail.info;

        const modalItem = document.createElement('div');
        modalItem.classList.add('connect-mi');
        modalItem.id = name.toLowerCase().replace(/\s+/g, '-');
        modalItem.addEventListener('click', () => connectToProvider(providerDetail));
        modalBody.appendChild(modalItem);

        const modalItemIcon = document.createElement('img');
        modalItemIcon.classList.add('connect-mim');
        modalItemIcon.src = icon;
        modalItem.appendChild(modalItemIcon);

        const modalItemName = document.createElement('span');
        modalItemName.classList.add('connect-min');
        modalItemName.innerText = name;
        modalItem.appendChild(modalItemName);
    });

    listDiscoveredProviders();
}


async function connectToProvider(providerDetail) {
    try {
        const provider = providerDetail.provider;
        console.log("[EIP-6963] Using provider:", providerDetail.info.name);

        // Always prompt for account selection
        const accounts = await provider.request({ method: "eth_requestAccounts" });
        if (!Array.isArray(accounts) || !accounts.length) {
            throw new Error("No accounts returned by the chosen provider.");
        }

        const primaryAccount = accounts[0];
        console.log("[EIP-6963] Connected account:", primaryAccount);

        return primaryAccount;
    } catch (error) {
        console.error("[EIP-6963] Error connecting to provider:", error);
        return null;
    }
}


const discoveredProviders = [];
document.addEventListener('DOMContentLoaded', function () { initProviders(); });
function initProviders() {
    window.addEventListener("eip6963:announceProvider", (event) => {
        discoveredProviders.push(event.detail);
        console.log(
            "[EIP-6963] Wallet announced:",
            event.detail.info.name,
            event.detail.info.rdns,
            event.detail.info.uuid
        );
    });
    window.dispatchEvent(new Event("eip6963:requestProvider"));
}
function listDiscoveredProviders() {
    console.log("[EIP-6963] Listing discovered providers:", discoveredProviders);
    return discoveredProviders;
}