import { UpdateInterface } from "../../../context/swap"

const MockFunctions: UpdateInterface = {
    createSwap: () => { throw new Error("Not implemented") },
    setCodeRequested: () => { throw new Error("Not implemented") },
    setAddressConfirmed: () => { throw new Error("Not implemented") },
    mutateSwap: () => { throw new Error("Not implemented") },
    setDepositeAddressIsfromAccount: () => { throw new Error("Not implemented") },
    setWithdrawType: () => {  },
    setInterval: () => { console.log("set interval called") },
    setSwapId: () => { throw new Error("Not implemented") },
}


export default MockFunctions