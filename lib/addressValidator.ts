import { keccak256 } from "js-sha3";
import KnownInternalNames from "./knownIds";
import { validateAndParseAddress } from "./starkNetAddressValidator";
import { PublicKey } from '@solana/web3.js'

export function isValidAddress(address?: string, network?: { name: string } | null): boolean {

    if (!address || isBlacklistedAddress(address)) {
        return false
    }
    if (network?.name.toLowerCase().startsWith("ZKSYNC".toLowerCase())) {
        if (address?.startsWith("zksync:")) {
            return isValidEtherAddress(address.replace("zksync:", ""));
        }
        return isValidEtherAddress(address);
    }
    else if (network?.name.toLowerCase().startsWith("STARKNET".toLowerCase())) {
        return validateAndParseAddress(address);
    }
    else if (network?.name.toLowerCase().startsWith("TON".toLowerCase())) {
        if (address.length === 48) return true
        else return false
    }
    else if (network?.name === KnownInternalNames.Networks.OsmosisMainnet) {
        if (/^(osmo1)?[a-z0-9]{38}$/.test(address)) {
            return true
        }
        return false
    }
    else if (network?.name === KnownInternalNames.Networks.SolanaMainnet || network?.name === KnownInternalNames.Networks.SolanaTestnet || network?.name === KnownInternalNames.Networks.SolanaDevnet) {
        try {
            let pubkey = new PublicKey(address)
            let isSolana = PublicKey.isOnCurve(pubkey.toBuffer())
            return isSolana
        } catch (error) {
            return false
        }
    }
    else if (network?.name === KnownInternalNames.Networks.SorareStage) {
        if (/^(0x)?[0-9a-f]{64}$/.test(address) || /^(0x)?[0-9A-F]{64}$/.test(address) || /^(0x)?[0-9a-f]{66}$/.test(address) || /^(0x)?[0-9A-F]{66}$/.test(address)) {
            return true;
        }
        return false
    }
    else {
        return isValidEtherAddress(address);
    }
}

function isValidEtherAddress(address: string): boolean {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        // check if it has the basic requirements of an address
        return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
        // If it's all small caps or all all caps, return true
        return true;
    } else {
        // Otherwise check each case
        return isChecksumAddress(address);
    }
}

function isChecksumAddress(address: string): boolean {
    // Check each case
    address = address.replace('0x', '');
    var addressHash = keccak256(address.toLowerCase());
    for (var i = 0; i < 40; i++) {
        // the nth letter should be uppercase if the nth digit of casemap is 1
        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
            return false;
        }
    }
    return true;
};

function isBlacklistedAddress(address: string): boolean {

    const BlacklistedAddresses = [
        "0xa9d38c3FB49074c00596a25CcF396402362C92C5",
        "0x4d70500858f9705ddbd56d007d13bbc92c9c67d1"
    ]

    let account = address

    if (account.includes(":")) {
        account = account.split(":")[1]
    }

    if (BlacklistedAddresses.find(a => a.toLowerCase() === account.toLowerCase())) return true
    else return false
}