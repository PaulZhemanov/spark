import React, { useMemo } from "react";
import { ethers } from "ethers";
import { makeAutoObservable } from "mobx";

import { ERC20_ABI } from "@src/abi";
import { TOKENS_BY_ASSET_ID, TOKENS_LIST } from "@src/constants";
import useVM from "@src/hooks/useVM";
import BN from "@src/utils/BN";
import { RootStore, useStores } from "@stores";

const ctx = React.createContext<FaucetVM | null>(null);

interface IProps {
  children: React.ReactNode;
}

export const FaucetVMProvider: React.FC<IProps> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new FaucetVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useFaucetVM = () => useVM(ctx);

const faucetAmounts: Record<string, number> = {
  ETH: 0.001,
  USDC: 3000,
  BTC: 0.01,
  UNI: 50,
};
const availableToMint = ["ETH", "UNI", "USDC"];

class FaucetVM {
  public rootStore: RootStore;

  loading: boolean = false;
  actionTokenAssetId: string | null = null;
  initialized: boolean = true;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  get faucetTokens() {
    const { balanceStore } = this.rootStore;

    return TOKENS_LIST.map((v) => {
      const balance = balanceStore.getBalance(v.assetId);
      const mintAmount = new BN(faucetAmounts[v.symbol] ?? 0);
      const formatBalance = BN.formatUnits(balance ?? BN.ZERO, v.decimals);
      return {
        ...TOKENS_BY_ASSET_ID[v.assetId],
        ...balance,
        formatBalance,
        mintAmount,
        disabled: !availableToMint.includes(v.symbol),
      };
    });
  }

  setActionTokenAssetId = (l: string | null) => (this.actionTokenAssetId = l);

  mint = async (assetId?: string) => {
    const { accountStore, balanceStore, notificationStore } = this.rootStore;
    if (assetId === undefined || !TOKENS_BY_ASSET_ID[assetId] === undefined || !accountStore.address) return;
    const token = TOKENS_BY_ASSET_ID[assetId];
    const tokenContract = new ethers.Contract(assetId, ERC20_ABI, accountStore.signer);

    const amount = ethers.parseUnits(faucetAmounts[token.symbol].toString(), token.decimals);
    try {
      this._setLoading(true);
      const tx = await tokenContract.mint(accountStore.address, amount);
      await tx.wait();
      notificationStore.toast("Minting successful!", { type: "success" });
    } catch (error: any) {
      notificationStore.toast(error.toString(), { type: "error" });
    } finally {
      this._setLoading(false);
      await balanceStore.update();
    }
  };

  // addAsset = async (assetId: string) => {
  //   const { fuel } = this.rootStore.accountStore;
  //   if (assetId === TOKENS_BY_SYMBOL.ETH.assetId) return;
  //   const token = TOKENS_BY_ASSET_ID[assetId];
  //   const asset = {
  //     name: token.name,
  //     assetId: token.assetId,
  //     imageUrl: window.location.origin + token.logo,
  //     symbol: token.symbol,
  //     isCustom: true,
  //   };
  //   return fuel.addAsset(asset);
  // };

  private _setLoading = (l: boolean) => (this.loading = l);
}
