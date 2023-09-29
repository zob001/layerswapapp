import { Link, ArrowLeftRight } from 'lucide-react';
import { FC, useEffect, useState } from 'react'
import SubmitButton from '../../../buttons/submitButton';
import toast from 'react-hot-toast';
import { useWalletState, useWalletUpdate } from '../../../../context/wallet';
import * as zksync from 'zksync';
import { providers, utils } from 'ethers';
import { useEthersProvider, useEthersSigner } from '../../../../lib/ethersToViem/ethers';
import { useSwapTransactionStore } from '../../../store/zustandStore';
import { PublishedSwapTransactionStatus } from '../../../../lib/layerSwapApiClient';
import { useSwapDataState } from '../../../../context/swap';
import { ConnectWalletButton } from './WalletTransfer/buttons';

type Props = {
    depositAddress: string,
    amount: number
}

const ZkSyncWalletWithdrawStep: FC<Props> = ({ depositAddress, amount }) => {
    const [loading, setLoading] = useState(false)
    const [transferDone, setTransferDone] = useState<boolean>()
    const { zkSyncAccount } = useWalletState()
    const { setZkSyncAccount } = useWalletUpdate()
    const { setSwapTransaction } = useSwapTransactionStore()
    const { swap } = useSwapDataState()
    const [syncWallet, setSyncWallet] = useState<zksync.Wallet | zksync.RemoteWallet>(null);
    const [depositReceipt, setDepositReceipt] = useState<any>(null);
    const [transfer, setTransfer] = useState<any>(null);
    const signer = useEthersSigner()
    const provider = useEthersProvider({chainId:1});

    useEffect(() => {
        if (depositReceipt?.success) {
            setSwapTransaction(swap?.id, PublishedSwapTransactionStatus.Completed, transfer?.txHash?.replace('sync-tx:', ''));
            setTransferDone(true)
        } else {
            setSwapTransaction(swap?.id, PublishedSwapTransactionStatus.Error, transfer?.txHash?.replace('sync-tx:', ''), depositReceipt?.failReason);
        }
    }, [depositReceipt])

    const handleConnect = async () => {
        setLoading(true)
        try {
            const syncProvider = await zksync.getDefaultProvider('mainnet');
            const wallet = await zksync.RemoteWallet.fromEthSigner(signer.provider as providers.Web3Provider, syncProvider);
            setSyncWallet(wallet);
            setZkSyncAccount(wallet.cachedAddress);
        }
        catch (e) {
            console.log(e)
            toast(e.message)
        }
        setLoading(false)
    }

    const handleTransfer = async () => {
        setLoading(true)
        try {
            if (syncWallet) {
                setZkSyncAccount(syncWallet.cachedAddress);
                const tf = await syncWallet.syncTransfer({
                    to: depositAddress,
                    token: 'ETH',
                    amount: zksync.closestPackableTransactionAmount(utils.parseEther(amount.toString())),
                    validUntil: zksync.utils.MAX_TIMESTAMP - swap.sequence_number,
                });
                setTransfer(tf)
                const res = await tf.awaitReceipt();
                setDepositReceipt(res);
            } else {
                const syncProvider = await zksync.getDefaultProvider('mainnet');
                const sw = await zksync.Wallet.fromEthSigner(signer, syncProvider);

                setZkSyncAccount(sw.cachedAddress);
                const tf = await sw.syncTransfer({
                    to: depositAddress,
                    token: 'ETH',
                    amount: zksync.closestPackableTransactionAmount(utils.parseEther(amount.toString())),
                    validUntil: zksync.utils.MAX_TIMESTAMP - swap.sequence_number,
                });
                setTransfer(tf)
                const res = await tf.awaitReceipt();
                setDepositReceipt(res);
            }
        }
        catch (e) {
            if (e?.message)
                toast(e.message)
        }
        setLoading(false)
    }

    if (!signer) {
        return <ConnectWalletButton />
    }

    return (
        <>
            <div className="w-full space-y-5 flex flex-col justify-between h-full text-primary-text">
                <div className='space-y-4'>
                    {/* <WarningMessage messageType='informing'>
                        <span className='flex-none'>
                            Learn how to send from
                        </span>
                        <GuideLink text={source_network?.display_name} userGuideUrl='https://docs.layerswap.io/user-docs/your-first-swap/off-ramp/send-assets-from-immutablex' />
                    </WarningMessage> */}
                    {
                        !zkSyncAccount &&
                        <SubmitButton isDisabled={loading} isSubmitting={loading} onClick={handleConnect} icon={<Link className="h-5 w-5 ml-2" aria-hidden="true" />} >
                            Connect
                        </SubmitButton>
                    }
                    {
                        zkSyncAccount &&
                        <SubmitButton isDisabled={loading || transferDone} isSubmitting={loading || transferDone} onClick={handleTransfer} icon={<ArrowLeftRight className="h-5 w-5 ml-2" aria-hidden="true" />} >
                            Transfer
                        </SubmitButton>
                    }
                </div>
            </div>
        </>
    )
}
export default ZkSyncWalletWithdrawStep;