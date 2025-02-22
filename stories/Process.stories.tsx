import type { Meta, StoryObj } from '@storybook/react';
import { SwapItem, BackendTransactionStatus, TransactionType, SwapResponse } from '../lib/layerSwapApiClient';
import { SwapStatus } from '../Models/SwapStatus';
import { SwapData, SwapDataStateContext, SwapDataUpdateContext } from '../context/swap';
import { SettingsStateContext } from '../context/settings';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { BalancesStateContext, BalancesStateUpdateContext } from '../context/balances';
import { walletConnectWallet, rainbowWallet, metaMaskWallet, bitgetWallet, argentWallet } from '@rainbow-me/rainbowkit/wallets';
import { FC, useEffect, useRef } from 'react';
import { LayerSwapAppSettings } from '../Models/LayerSwapAppSettings';
import { swap, failedSwap, failedSwapOutOfRange, failedInputSwap, cancelled, expired } from './Data/swaps'
import { SettingChains, Settings } from './Data/settings';
import { initialValues } from './Data/initialValues';
import { AuthDataUpdateContext, AuthStateContext, UserType } from '../context/authContext';
import { IntercomProvider } from 'react-use-intercom';
import { THEME_COLORS } from '../Models/Theme';
import Layout from '../components/layout';
import RainbowKitComponent from '../components/RainbowKit';
import SwapDetails from '../components/Swap';
import SwapMockFunctions from './Mocks/context/SwapDataUpdate';
import AuthMockFunctions from './Mocks/context/AuthDataUpdate';
import WalletMockFunctions from './Mocks/context/BalancesMockFunctions';
import BalancesStateMock from './Mocks/context/BalancesState';
import { Formik, FormikProps } from 'formik';
import { SwapFormValues } from '../components/DTOs/SwapFormValues';
import { useQueryState } from '../context/query';
import MainStepValidation from '../lib/mainStepValidator';
import { FeeProvider, useFee } from '../context/feeContext';
import { useArgs } from '@storybook/preview-api';

const WALLETCONNECT_PROJECT_ID = '28168903b2d30c75e5f7f2d71902581b';
const settingsChains = SettingChains;

const { chains, publicClient } = configureChains(
    settingsChains,
    [
        publicProvider()
    ]
);

const projectId = WALLETCONNECT_PROJECT_ID;
const connectors = connectorsForWallets([
    {
        groupName: 'Popular',
        wallets: [
            metaMaskWallet({ projectId, chains }),
            walletConnectWallet({ projectId, chains }),
        ],
    },
    {
        groupName: 'Wallets',
        wallets: [
            argentWallet({ projectId, chains }),
            bitgetWallet({ projectId, chains }),
            rainbowWallet({ projectId, chains }),
        ],
    },
]);
window.plausible = () => { }
const Comp: FC<{ settings: any, swap: SwapItem, failedSwap?: SwapItem, failedSwapOutOfRange?: SwapItem, failedInputSwap?: SwapItem, theme?: "default" | "light", initialValues?: SwapFormValues, timestamp?: string }> = ({ settings, swap, failedSwap, failedSwapOutOfRange, theme, initialValues, timestamp, failedInputSwap }) => {
    const query = useQueryState()
    const wagmiConfig = createConfig({
        autoConnect: true,
        connectors,
        publicClient,
    })

    const formikRef = useRef<FormikProps<SwapFormValues>>(null);
    const appSettings = new LayerSwapAppSettings(Settings)
    const swapContextInitialValues: SwapData = { codeRequested: false, swapResponse: undefined, addressConfirmed: false, depositeAddressIsfromAccount: false, withdrawType: undefined, swapTransaction: undefined }

    if (!appSettings) {
        return <div>Loading...</div>
    }
    const themeData = theme ? THEME_COLORS[theme] : THEME_COLORS["default"];

    return <WagmiConfig config={wagmiConfig}>
        <IntercomProvider appId='123'>
            <SettingsStateContext.Provider value={appSettings}>
                <Layout settings={Settings} themeData={themeData}>
                    <RainbowKitComponent>
                        <SwapDataStateContext.Provider value={swapContextInitialValues}>
                            <AuthStateContext.Provider value={{ authData: undefined, email: "asd@gmail.com", codeRequested: false, guestAuthData: undefined, tempEmail: undefined, userId: "1", userLockedOut: false, userType: UserType.AuthenticatedUser }}>
                                <AuthDataUpdateContext.Provider value={AuthMockFunctions}>
                                    <SwapDataUpdateContext.Provider value={SwapMockFunctions}>
                                        <BalancesStateContext.Provider value={BalancesStateMock}>
                                            <BalancesStateUpdateContext.Provider value={WalletMockFunctions}>
                                                <Formik
                                                    innerRef={formikRef}
                                                    initialValues={initialValues!}
                                                    validateOnMount={true}
                                                    validate={MainStepValidation({ minAllowedAmount: 8, maxAllowedAmount: 10 })}
                                                    onSubmit={() => { }}
                                                >
                                                    <FeeProvider>
                                                        <Component initialValues={initialValues} />
                                                    </FeeProvider>
                                                </Formik>
                                            </BalancesStateUpdateContext.Provider>
                                        </BalancesStateContext.Provider>
                                    </SwapDataUpdateContext.Provider>
                                </AuthDataUpdateContext.Provider>
                            </AuthStateContext.Provider>
                        </SwapDataStateContext.Provider >
                    </RainbowKitComponent>
                </Layout>
            </SettingsStateContext.Provider>
        </IntercomProvider>
    </WagmiConfig >
}

const Component = ({ initialValues }: { initialValues: SwapFormValues | undefined }) => {
    const { valuesChanger } = useFee()
    useEffect(() => {
        valuesChanger(initialValues!)
    }, [])
    return (
        <SwapDetails type='widget' />
    )
}

const DUMMY_TRANSACTION = {
    from: "0x5da5c2a98e26fd28914b91212b1232d58eb9bbab",
    to: "0x142c03fc8fd30d11ed17ef0f48a9941fd4a66953",
    created_date: "2023-08-16T16:33:23.4937+00:00",
    transaction_hash: "0xae9231b805139bee7e92ddae631b13bb2d13a09e106826b4f08e8efa965d1c27",
    confirmations: 28,
    max_confirmations: 12,
    amount: 0.00093,
    usd_price: 1819.02,
    type: TransactionType,
    usd_value: 1.6916886,
    status: BackendTransactionStatus,
    timestamp: ''
}

const meta = {
    title: 'LayerSwap/Process',
    component: Comp,
    parameters: {
        layout: 'centered',
    },
    args: {
        theme: 'default',
        timestamp: '',
    },
    argTypes: {
        theme: {
            options: ['light', 'default', 'evmos', 'imxMarketplace', 'ea7df14a1597407f9f755f05e25bab42'],
            control: { type: 'select' },
        },
        timestamp: {
            control: 'date',
        }
    },

    render: function Render(args, { loaded: { settings } }) {
        const [{ swap, timestamp }, updateArgs] = useArgs();

        const handleUpdateArgs = () => {
            const updatedSwap = {
                ...args.swap,
                transactions: swap?.transactions?.map(transaction => {
                    if (transaction.type === 'input' && (transaction.timestamp || transaction.timestamp === '')) {
                        return {
                            ...transaction,
                            timestamp: timestamp ? new Date(timestamp)?.toISOString() : new Date().toISOString(),
                        };
                    }
                    return transaction;
                }),
            };
            if (updatedSwap?.transactions?.[0]?.timestamp || updatedSwap?.transactions?.[0]?.timestamp === '') {
                updateArgs({ swap: updatedSwap, timestamp: new Date(timestamp)?.toISOString() || new Date().toISOString() })
            }
        }

        useEffect(() => {
            if (timestamp !== swap?.transactions?.[0]?.timestamp) {
                handleUpdateArgs()
            }
        }, [timestamp, swap])
        return <Comp {...args} settings={settings} initialValues={initialValues} />
    },
} satisfies Meta<typeof Comp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UserTransferInitiated: Story = {
    args: {
        swap: {
            ...swap.swap,
            status: SwapStatus.UserTransferPending,
            transactions: [
            ]
        },
    },
    loaders: [
        async () => ({
            A: window.localStorage.setItem("swapTransactions", `{"${swap.swap.id}": {"hash": "0xe1d8539c6dbe522560c41d645f10ffc3f50b8f689a4ce4774573576cb845d5fc", "status":2}}`)
        }),
    ],
};

export const UserTransferDetected: Story = {
    args: {
        swap: {
            ...swap.swap,
            status: SwapStatus.UserTransferPending,
            transactions: [
                { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Initiated, type: TransactionType.Input, confirmations: 2, max_confirmations: 3 },
            ]
        }
    }
};
export const UserTransferPendingInputCompleted: Story = {
    args: {
        swap: {
            ...failedSwap.swap,
            status: SwapStatus.UserTransferPending,
            transactions: [
                { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Input },
            ]
        }
    },
};

export const LsTransferPending: Story = {
    args: {
        swap: {
            ...failedSwap.swap,
            status: SwapStatus.LsTransferPending,
            transactions: [
                { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Input },
                { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Pending, type: TransactionType.Output },
            ]
        }
    }
};

export const LsTransferPendingWithRefuel: Story = {
    args: {
        swap: {
            ...swap.swap,
            status: SwapStatus.LsTransferPending,
            transactions: [
                { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Input },
                { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Pending, type: TransactionType.Output },
                { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Pending, type: TransactionType.Refuel },
            ]
        }
    }
};

export const LsTransferInitiated: Story = {
    args: {
        swap: {
            ...swap.swap,
            status: SwapStatus.LsTransferPending,
            transactions: [
                { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Input },
                { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Initiated, type: TransactionType.Output, confirmations: 2, max_confirmations: 5 },
                { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Initiated, type: TransactionType.Refuel, confirmations: 1, max_confirmations: 5 },
            ]
        }
    }
};

export const Completed: Story = {
    args: {
        swap: {
            ...swap.swap,
            status: SwapStatus.Completed,
            transactions: [
                { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Input },
                { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Output },
                { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Refuel },
            ]
        }
    }
};

export const OnlyRefuelCompleted: Story = {
    args: {
        swap: {
            ...swap.swap,
            status: SwapStatus.LsTransferPending,
            transactions: [
                { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Input },
                { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Pending, type: TransactionType.Output },
                { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Refuel },
            ]
        }
    }
};


export const UserTransferDelayed: Story = {
    args: {
        swap: {
            ...swap.swap,
            status: SwapStatus.UserTransferDelayed,
            transactions: [
                { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Pending, type: TransactionType.Input },
            ]
        }
    }
};

export const Failed: Story = {
    args: {
        swap: {
            ...failedSwap.swap,
            status: SwapStatus.Failed,
            transactions: [
                { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Input },
            ]
        }
    }
};

export const FailedInput: Story = {
    args: {
        swap: {
            ...failedInputSwap.swap,
            status: SwapStatus.UserTransferPending,
        },
    },
    loaders: [
        async () => ({
            A: window.localStorage.setItem("swapTransactions", `{"${failedInputSwap.swap.id}": {"hash": "0x529ab89f4ed2ece53ca51f52d11e5123f5e5c43c09a9d054d243de0e0829d15f", "status":"failed"}}`),
        }),
    ]
};

export const FailedOutOfRangeAmount: Story = {
    args: {
        swap: {
            ...failedSwapOutOfRange.swap,
            status: SwapStatus.Failed,
            transactions: [
                { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Input },
            ]
        }
    }
};

export const Cancelled: Story = {
    args: {
        swap: {
            ...cancelled.swap,
            status: SwapStatus.Cancelled,
            transactions: [
            ]
        }
    }
};

export const Expired: Story = {
    args: {
        swap: {
            ...expired.swap,
            status: SwapStatus.Expired,
            transactions: [
            ]
        }
    }
};