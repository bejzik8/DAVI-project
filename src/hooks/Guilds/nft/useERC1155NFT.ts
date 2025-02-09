import { resolveUri } from 'utils/url';
import ERC1155 from 'contracts/ERC1155.json';
import { useContractReads } from 'wagmi';

export default function useERC1155NFT(
  contractId: string,
  tokenId: string,
  ownerAddress: string,
  chainId?: number
) {
  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        addressOrName: contractId,
        contractInterface: ERC1155.abi,
        functionName: 'balanceOf',
        chainId,
        args: [ownerAddress, tokenId],
      },
      {
        addressOrName: contractId,
        contractInterface: ERC1155.abi,
        functionName: 'uri',
        chainId,
        args: [tokenId],
      },
    ],
  });

  if (!data || data.every(v => v === null)) {
    return { data: undefined, isError, isLoading };
  }
  const [balanceOf, tokenURI] = data;
  const resolvedTokenUri = resolveUri(tokenURI?.toString());

  return {
    balance: balanceOf,
    resolvedTokenUri,
    isError,
    isLoading,
  };
}
