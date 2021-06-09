const fs = require("fs");
const hre = require("hardhat");
const web3 = hre.web3;
const { getNetworkConfig } = require('../src/config');
const { updateNetworkCache } = require('../src/utils/cache');

import { DaoCache, DaoInfo } from '../src/types';

async function main() {
  
  // Initializing cache based on stored cache file and network used, if used localhost the cache is always restarted
  const networkName = hre.network.name;
  const contractsConfig = getNetworkConfig(networkName);
  
  let cacheFile: DaoCache = fs.existsSync('./src/cache.json')
    ? JSON.parse(fs.readFileSync('./src/cache.json', 'utf-8'))
    : {
      [networkName] : {
        blockNumber: contractsConfig.fromBlock,
        daoInfo: {} as DaoInfo,
        schemes: {},
        proposals: {},
        users: {},
        callPermissions: {},
        votingMachineEvents: {
          votes: [],
          stakes: [],
          redeems: [],
          redeemsRep: [],
          proposalStateChanges: []
        },
        ipfsHashes: []
      }
    };
    
  let networkCache = (!cacheFile[networkName])
    ? {
      blockNumber: networkName != 'localhost' ? contractsConfig.fromBlock : 1,
      daoInfo: {} as DaoInfo,
      schemes: {},
      proposals: {},
      users: {},
      callPermissions: {},
      votingMachineEvents: {
        votes: [],
        stakes: [],
        redeems: [],
        redeemsRep: [],
        proposalStateChanges: []
      },
      ipfsHashes: []
    } : (networkName == 'localhost') ?
    {
      blockNumber: 1,
      daoInfo: {} as DaoInfo,
      schemes: {},
      proposals: {},
      users: {},
      callPermissions: {},
      votingMachineEvents: {
        votes: [],
        stakes: [],
        redeems: [],
        redeemsRep: [],
        proposalStateChanges: []
      },
      ipfsHashes: []
    } : cacheFile[networkName];
  
  // Set block range for the script to run
  const fromBlock = networkCache.blockNumber;
  const toBlock = process.env.CACHE_TO_BLOCK || await web3.eth.getBlockNumber();
  
  console.log('Runing cache script from block', fromBlock, 'to block', toBlock, 'in network', networkName);
  
  cacheFile[networkName] = await updateNetworkCache(networkCache, networkName, fromBlock, toBlock, web3);

  fs.writeFileSync("./src/cache.json", JSON.stringify(cacheFile), { encoding: "utf8", flag: "w" });

} 

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });