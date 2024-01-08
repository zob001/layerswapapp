import MetaMaskIcon from "../../../components/icons/Wallets/MetaMask"
import WalletConnectIcon from "../../../components/icons/Wallets/WalletConnect"
import BitKeep from "../../../components/icons/Wallets/BitKeep"
import RainbowIcon from "../../../components/icons/Wallets/Rainbow"
import CoinbaseIcon from "../../../components/icons/Wallets/Coinbase"
import { Coins } from "lucide-react"
import Phantom from "../../../components/icons/Wallets/Phantom"
import { Connector } from "wagmi"
import AddressIcon from "../../../components/AddressIcon"

export const ResolveEVMWalletIcon = ({ connector, address }: { connector: Connector<any, any>, address: string }) => {
    let icon: ((props: any) => JSX.Element) | null = null;

    // Check first by id then by name
    switch (connector?.id?.toLowerCase()) {
        // case KnownKonnectorIds.MetaMask:
        //     icon = MetaMaskIcon;
        //     break;
        case KnownKonnectorIds.WalletConnect:
            icon = WalletConnectIcon;
            break;
        case KnownKonnectorIds.Rainbow:
            icon = RainbowIcon;
            break;
        case KnownKonnectorIds.BitKeep:
            icon = BitKeep;
            break;
        case KnownKonnectorIds.CoinbaseWallet:
            icon = CoinbaseIcon;
            break;
    }

    if (icon == null) {
        switch (connector?.name?.toLowerCase()) {
            case KnownKonnectorNames.Phantom:
                icon = Phantom;
                break;
        }
    }

    if (icon == null) {
        icon = AddressIconWrapper(address)
    }

    return icon;
}

const KnownKonnectorIds = {
    MetaMask: 'metamask',
    WalletConnect: 'walletconnect',
    Rainbow: 'rainbow',
    BitKeep: 'bitkeep',
    CoinbaseWallet: 'coinbasewallet',
}

const KnownKonnectorNames = {
    Phantom: 'phantom',
}

const AddressIconWrapper = (address: string) => (props) => {
    return <AddressIcon {...props} address={address} size={24} />
}
