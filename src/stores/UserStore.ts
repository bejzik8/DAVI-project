import { makeObservable, observable, action } from 'mobx';
import RootStore from 'stores';
import { ContractType } from './Provider';
import { bnum } from '../utils/helpers';

export default class UserStore {
  userInfo: UserInfo;
  rootStore: RootStore;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.userInfo = {
      address: rootStore.providerStore.getActiveWeb3React(),
      ethBalance: bnum(0),
      repBalance: bnum(0),
      dxdBalance: bnum(0),
      dxdApproved: bnum(0)
    };
    makeObservable(this, {
        userInfo: observable,
        update: action
      }
    );
  }
  
  getUserInfo() {
    return this.userInfo;
  }

  update() {
    const { configStore, providerStore, blockchainStore } = this.rootStore;
    const { account } = providerStore.getActiveWeb3React();
    
    const repBalance = account ? this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.Reputation,
      address: configStore.getNetworkConfig().reputation,
      method: 'balanceOf',
      params: [account]
    }) : bnum(0);
    
    const ethBalance = account ? this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.Multicall,
      address: configStore.getNetworkConfig().multicall,
      method: 'getEthBalance',
      params: [account]
    }) : bnum(0);
    
    const dxdBalance = account ? this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.ERC20,
      address: configStore.getNetworkConfig().votingMachineToken,
      method: 'balanceOf',
      params: [account]
    }) : bnum(0);
    
    const dxdApproved = account ? this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.ERC20,
      address: configStore.getNetworkConfig().votingMachineToken,
      method: 'allowance',
      params: [account, configStore.getNetworkConfig().votingMachine]
    }) : bnum(0);
    
    this.userInfo = {
      address: account,
      ethBalance,
      repBalance,
      dxdBalance,
      dxdApproved
    };
  }
  
}