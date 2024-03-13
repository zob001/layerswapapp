import { FC } from "react"
import { ApiResponse } from "../../../../Models/ApiResponse"
import { useSettingsState } from "../../../../context/settings"
import { useSwapDataState } from "../../../../context/swap"
import KnownInternalNames from "../../../../lib/knownIds"
import LayerSwapApiClient, { DepositAddress } from "../../../../lib/layerSwapApiClient"
import ImtblxWalletWithdrawStep from "./ImtblxWalletWithdrawStep"
import StarknetWalletWithdrawStep from "./StarknetWalletWithdraw"
import useSWR from 'swr'
import TransferFromWallet from "./WalletTransfer"
import ZkSyncWalletWithdrawStep from "./ZKsyncWalletWithdraw"
import useWalletTransferOptions from "../../../../hooks/useWalletTransferOptions"
import LoopringWalletWithdraw from "./Loopring"
import { useFee } from "../../../../context/feeContext"
import SolanaWalletWithdrawStep from "./SolanaWalletWithdraw"
import NetworkGas from "./WalletTransfer/networkGas"

//TODO have separate components for evm and none_evm as others are sweepless anyway
const WalletTransferContent: FC = () => {
    const { swap } = useSwapDataState()
    const { layers } = useSettingsState()
    const { minAllowedAmount } = useFee()

    const { source_network: source_network_internal_name } = swap || {}
    const source_layer = layers.find(n => n.internal_name === source_network_internal_name)
    const sourceAsset = source_layer?.assets?.find(c => c.asset.toLowerCase() === swap?.source_network_asset.toLowerCase())

    const sourceIsImmutableX = swap?.source_network?.toUpperCase() === KnownInternalNames.Networks.ImmutableXMainnet?.toUpperCase() || swap?.source_network === KnownInternalNames.Networks.ImmutableXGoerli?.toUpperCase()
    const sourceIsZkSync = swap?.source_network?.toUpperCase() === KnownInternalNames.Networks.ZksyncMainnet?.toUpperCase()
    const sourceIsStarknet = swap?.source_network?.toUpperCase() === KnownInternalNames.Networks.StarkNetMainnet?.toUpperCase() || swap?.source_network === KnownInternalNames.Networks.StarkNetGoerli?.toUpperCase()
    const sourceIsLoopring = swap?.source_network?.toUpperCase() === KnownInternalNames.Networks.LoopringMainnet?.toUpperCase() ||
        swap?.source_network?.toUpperCase() === KnownInternalNames.Networks.LoopringGoerli?.toUpperCase()
    const sourceIsSolana = source_network_internal_name?.toUpperCase() === KnownInternalNames.Networks.SolanaMainnet?.toUpperCase()

    const { canDoSweepless, isContractWallet } = useWalletTransferOptions()
    const shouldGetGeneratedAddress = isContractWallet?.ready && !canDoSweepless
    const generateDepositParams = shouldGetGeneratedAddress ? [source_network_internal_name] : null

    const layerswapApiClient = new LayerSwapApiClient()
    const {
        data: generatedDeposit
    } = useSWR<ApiResponse<DepositAddress>>(generateDepositParams, ([network]) => layerswapApiClient.GenerateDepositAddress(network), { dedupingInterval: 60000 })

    const managedDepositAddress = source_layer?.managed_accounts?.[0]?.address;
    const generatedDepositAddress = generatedDeposit?.data?.address

    const depositAddress = isContractWallet?.ready ?
        (canDoSweepless ? managedDepositAddress : generatedDepositAddress)
        : undefined

    const sourceChainId = source_layer ? Number(source_layer?.chain_id) : null
    const requested_amount = Number(minAllowedAmount) > Number(swap?.requested_amount) ? minAllowedAmount : swap?.requested_amount

    if (sourceIsImmutableX)
        return <ImtblxWalletWithdrawStep
            depositAddress={depositAddress}
        />
    else if (sourceIsStarknet)
        return <StarknetWalletWithdrawStep
            amount={requested_amount}
            depositAddress={depositAddress}
        />
    else if (sourceIsZkSync)
        return <>
            {requested_amount
                && <ZkSyncWalletWithdrawStep
                    depositAddress={depositAddress}
                    amount={requested_amount}
                />}
        </>
    else if (sourceIsLoopring)
        return <LoopringWalletWithdraw
            amount={requested_amount}
            depositAddress={depositAddress}
        />
    else if (sourceIsSolana)
        return <>
            {requested_amount &&
                <SolanaWalletWithdrawStep
                    depositAddress={depositAddress}
                    amount={requested_amount}
                />}
        </>
    else
        return <>
            {swap && source_layer && sourceAsset && requested_amount && sourceChainId && <TransferFromWallet
                sequenceNumber={swap?.sequence_number}
                swapId={swap.id}
                networkDisplayName={source_layer?.display_name}
                tokenDecimals={sourceAsset?.decimals}
                tokenContractAddress={sourceAsset.contract_address}
                chainId={sourceChainId}
                depositAddress={depositAddress}
                userDestinationAddress={swap.destination_address}
                amount={requested_amount}
            />}
        </>
}


const WalletTransferWrapper = () => {
    const { swap } = useSwapDataState()
    const { layers } = useSettingsState()

    const { source_network: source_network_internal_name } = swap || {}
    const source_layer = layers.find(n => n.internal_name === source_network_internal_name)
    const sourceAsset = source_layer?.assets?.find(c => c.asset.toLowerCase() === swap?.source_network_asset.toLowerCase())

    return <div className='border-secondary-500 rounded-md border bg-secondary-700 p-3'>
        {source_layer && sourceAsset && <NetworkGas network={source_layer} selected_currency={sourceAsset} />}
        <WalletTransferContent />
    </div>
}

export default WalletTransferWrapper
