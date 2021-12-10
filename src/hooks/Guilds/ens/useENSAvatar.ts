import { namehash } from 'ethers/utils';
import { useEffect, useMemo, useState } from 'react';
import { MAINNET_WEB3_ROOT_KEY } from '../../../components/MainnetWeb3Manager';
import { resolveUri } from '../../../utils/url';
import useENS from './useENS';
import useENSResolver from './useENSResolver';
import useERC721NFT from '../nft/useERC721NFT';
import useERC1155NFT from '../nft/useERC1155NFT';

const useENSAvatar = (ethAddress: string) => {
  const { name: ensName } = useENS(ethAddress);
  const resolver = useENSResolver(ensName);
  const [avatarUri, setAvatarUri] = useState<string>(null);
  const { imageUrl } = useENSAvatarNFT(avatarUri, ethAddress);

  useEffect(() => {
    if (!resolver) return;

    async function getAvatarUri() {
      try {
        let avatar = await resolver.text(namehash(ensName), 'avatar');
        return avatar;
      } catch (e) {
        console.error('[useENSAvatar] Error resolving ENS avatar', e);
        return null;
      }
    }

    getAvatarUri().then(setAvatarUri);
  }, [resolver, ensName]);

  return { ensName, avatarUri, imageUrl };
};

const useENSAvatarNFT = (
  nftUri: string,
  ownerAddress: string,
  web3Context = MAINNET_WEB3_ROOT_KEY
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

  const { ownerAddress: ERC721Owner, metadata: ERC721Metadata } = useERC721NFT(
    decodedUrl.type === 'erc721' ? decodedUrl.contractId : null,
    decodedUrl.tokenId,
    web3Context
  );
  const { balance: ERC1155Balance, metadata: ERC1155Metadata } = useERC1155NFT(
    decodedUrl.type === 'erc1155' ? decodedUrl.contractId : null,
    decodedUrl.tokenId,
    ownerAddress,
    web3Context
  );

  let imageUrl: string = useMemo(() => {
    if (decodedUrl.type === 'http') {
      return decodedUrl.imageUri;
    } else if (
      decodedUrl.type === 'erc721' &&
      ERC721Owner?.toLowerCase() === ownerAddress.toLowerCase()
    ) {
      return ERC721Metadata.imageUri;
    } else if (decodedUrl.type === 'erc1155' && ERC1155Balance > 0) {
      return ERC1155Metadata.imageUri;
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