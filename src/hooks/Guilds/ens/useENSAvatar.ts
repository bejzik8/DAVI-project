import { useMemo } from 'react';
import { resolveUri } from 'utils/url';
import useENS from './useENS';
import { useENSAvatarUri } from './useENSPublicResolverContract';
import useERC721NFT from 'hooks/Guilds/nft/useERC721NFT';
import useERC1155NFT from 'hooks/Guilds/nft/useERC1155NFT';
import useSWR from 'swr';

const useENSAvatar = (nameOrAddress: string, chainId?: number) => {
  const { name: ENSName, address: ethAddress } = useENS(nameOrAddress, chainId);
  const { avatarUri } = useENSAvatarUri(ENSName, chainId);
  const { imageUrl } = useENSAvatarNFT(avatarUri, ethAddress, chainId);

  const imageUrlToUse = useMemo(() => {
    if (avatarUri) {
      // TODO: Consider chainId when generating ENS metadata service fallback URL
      return (
        imageUrl || `https://metadata.ens.domains/mainnet/avatar/${ENSName}`
      );
    } else {
      return null;
    }
  }, [imageUrl, ENSName, avatarUri]);

  return { ensName: ENSName, imageUrl: imageUrlToUse };
};

const useENSAvatarNFT = (
  nftUri: string,
  ownerAddress: string,
  chainId?: number
) => {
  const decodedUrl = useMemo(() => {
    if (!nftUri) return {};

    let match = new RegExp(/([a-z]+):\/\/(.*)/).exec(nftUri);
    if (match && match.length === 3)
      return {
        type: 'http',
        imageUri: resolveUri(nftUri),
      };

    // Match ERC-721 NFT reference
    match = new RegExp(/eip155:1\/erc721:(\w+)\/(\w+)/).exec(nftUri);
    if (match && match.length === 3) {
      const contractId = match[1].toLowerCase();
      const tokenId = match[2];

      return {
        type: 'erc721',
        contractId,
        tokenId,
      };
    }

    match = new RegExp(/eip155:1\/erc1155:(\w+)\/(\w+)/).exec(nftUri);
    if (match && match.length === 3) {
      const contractId = match[1].toLowerCase();
      const tokenId = match[2];

      return {
        type: 'erc1155',
        contractId,
        tokenId,
      };
    }

    return {};
  }, [nftUri]);
  const { ownerAddress: ERC721Owner, resolvedTokenUri: ERC721TokenUri } =
    useERC721NFT(
      decodedUrl.type === 'erc721' ? decodedUrl.contractId : null,
      decodedUrl.tokenId,
      chainId
    );
  const { data: ERC721Metadata } = useSWR(ERC721TokenUri);
  const { balance: ERC1155Balance, resolvedTokenUri: ERC1155TokenUri } =
    useERC1155NFT(
      decodedUrl.type === 'erc1155' ? decodedUrl.contractId : null,
      decodedUrl.tokenId,
      ownerAddress,
      chainId
    );
  const { data: ERC1155Metadata } = useSWR(ERC1155TokenUri);
  let imageUrl: string = useMemo(() => {
    if (!decodedUrl || !ownerAddress || !ERC721Owner) return null;

    if (decodedUrl.type === 'http') {
      return decodedUrl.imageUri;
    } else if (
      decodedUrl.type === 'erc721' &&
      ERC721Owner?.toLowerCase() === ownerAddress.toLowerCase()
    ) {
      return ERC721Metadata?.imageUri;
    } else if (decodedUrl.type === 'erc1155' && ERC1155Balance?.gt(0)) {
      return ERC1155Metadata?.image;
    }

    return null;
  }, [
    decodedUrl,
    ERC721Owner,
    ERC721Metadata,
    ERC1155Balance,
    ERC1155Metadata,
    ownerAddress,
  ]);

  return {
    imageUrl,
  };
};

export default useENSAvatar;
