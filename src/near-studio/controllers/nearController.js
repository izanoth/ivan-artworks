import { 
    call as nearCall, 
    yoctoToNear as _yoctoToNear,
} from "../services/near";
import {
    openSession as svcOpenSession,
    closeSession as svcCloseSession,
    getSessionInfo as svcGetSessionInfo,
    getSupportedNetworks as svcGetSupportedNetworks,
} from "../services/session";

export async function openSession(params) {
    return await svcOpenSession(params);
}

export function closeSession() {
    return svcCloseSession();
}

export function getSessionInfo() {
    return svcGetSessionInfo();
}

export function getSupportedNetworks() {
    return svcGetSupportedNetworks();
}

export function yoctoToNear(yocto) {
    return _yoctoToNear(yocto);
}

export async function purchase({ contractId, tokenId, marketplaceId, depositNear, gas, accountId }) {
    const result = await nearCall(
        "nft_buy",
        {
            token_id: tokenId,
            memo: `marketplace:${marketplaceId}`,
        },
        depositNear,
        gas,
    );

    const txHash = result.transactionHash || result.log?.transactionHash || (result.result && (result.result.transaction?.hash || result.result.transaction_outcome?.id)) || null;

    return { result, transactionHash: txHash };
}

export default { 
    yoctoToNear, 
    purchase,
    openSession, 
    closeSession, 
    getSessionInfo, 
    getSupportedNetworks,
 };
