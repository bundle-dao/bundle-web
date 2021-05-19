export {}
declare global {
    interface Window {
        ethereum: any;
        web3: any;
    }
}

window.ethereum = window.ethereum || {};
window.web3 = window.ethereum || {};