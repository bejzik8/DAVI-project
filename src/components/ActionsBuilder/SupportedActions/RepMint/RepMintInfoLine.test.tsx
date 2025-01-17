import { BigNumber } from 'ethers';
import { render } from 'utils/tests';
import RepMintInfoLine from './RepMintInfoLine';
import {
  repMintDecodedCallMock,
  repMintEmptyDecodedCallMock,
} from './fixtures';

const mockBigNumber = BigNumber.from(100000000);

jest.mock('hooks/Guilds/ens/useENSAvatar', () => ({
  __esModule: true,
  default: () => ({
    avatarUri: 'test',
    imageUrl: 'test',
    ensName: 'test.eth',
  }),
}));

jest.mock('hooks/Guilds/guild/useTokenData', () => ({
  useTokenData: () => ({
    tokenData: {
      symbol: 'REP',
      decimals: 18,
      name: 'Reputation',
      address: '0x0000000000000000000000000000000000000000',
      totalSupply: mockBigNumber,
    },
  }),
}));

describe('RepMintInfoLine', () => {
  it('Should match snapshot', () => {
    const { container } = render(
      <RepMintInfoLine decodedCall={repMintDecodedCallMock} />
    );
    expect(container).toMatchSnapshot();
  });
  it('Should match snapshot in compact mode', () => {
    const { container } = render(
      <RepMintInfoLine decodedCall={repMintDecodedCallMock} compact={true} />
    );
    expect(container).toMatchSnapshot();
  });
  it('Should match snapshot without data', () => {
    const { container } = render(<RepMintInfoLine decodedCall={null} />);
    expect(container).toMatchSnapshot();
  });

  it('Should match snapshot without data in compact mode', () => {
    const { container } = render(
      <RepMintInfoLine decodedCall={null} compact={true} />
    );
    expect(container).toMatchSnapshot();
  });
  it('Should match snapshot with default values', () => {
    const { container } = render(
      <RepMintInfoLine decodedCall={repMintEmptyDecodedCallMock} />
    );
    expect(container).toMatchSnapshot();
  });
  it('Should match snapshot with default values in compact mode', () => {
    const { container } = render(
      <RepMintInfoLine
        decodedCall={repMintEmptyDecodedCallMock}
        compact={true}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
