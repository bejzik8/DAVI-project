const contractsFile = require('./contracts.json');
const dataFile = require('./data.json');

export const getNetworkConfig = function(network) {
  const networkData = dataFile[network] || {
    tokens: {}
  };
  
  if (network === 'localhost') {
    return Object.assign(networkData, {
      avatar: process.env.REACT_APP_AVATAR_ADDRESS.replace(/["']/g, ""),
      controller: process.env.REACT_APP_CONTROLLER_ADDRESS.replace(/["']/g, ""),
      reputation: process.env.REACT_APP_REPUTATION_ADDRESS.replace(/["']/g, ""),
      votingMachine: process.env.REACT_APP_VOTING_MACHINE_ADDRESS.replace(/["']/g, ""),
      votingMachineToken: process.env.REACT_APP_VOTING_MACHINE_TOKEN_ADDRESS.replace(/["']/g, ""),
      permissionRegistry: process.env.REACT_APP_PERMISSION_REGISTRY_ADDRESS.replace(/["']/g, ""),
      multicall: process.env.REACT_APP_MULTICALL_ADDRESS.replace(/["']/g, ""),
      fromBlock: 1
    })
  } else {
    return Object.assign(networkData, contractsFile[network]);
  };
}