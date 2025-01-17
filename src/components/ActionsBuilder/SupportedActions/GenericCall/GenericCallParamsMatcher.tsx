import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { ChildrenNode, Matcher, MatchResponse, Node } from 'interweave';
import moment from 'moment';
import { shortenAddress } from 'utils';
import { ENSAvatar } from 'components/Avatar';
import { FunctionParamWithValue } from './GenericCallInfoLine';

interface MatcherOptions {
  params: FunctionParamWithValue[];
}

interface MatchResult {
  matchedParam: string;
}

class GenericCallParamsMatcher extends Matcher<{}, MatcherOptions> {
  renderByParamType(param: FunctionParamWithValue) {
    if (!param) return null;

    switch (param.component) {
      case 'address':
        return (
          <>
            <ENSAvatar address={param.value} size={16} />{' '}
            {shortenAddress(param.value)}
          </>
        );
      case 'integer':
      case 'decimal':
        const bn = BigNumber.from(param.value);
        return bn.toString();
      case 'date':
        return moment.unix(Number(param.value)).format('YYYY-MM-DD');
      case 'duration':
      case 'time':
        return moment.duration(Number(param.value), 'seconds').humanize();
      case 'boolean':
        return `${param.value}`;
      case 'tokenAmount':
        // TODO: Handle number of decimals better
        const number = BigNumber.from(param.value);
        let formatted = Number.parseFloat(formatUnits(number, 18));
        return Math.round(formatted * Math.pow(10, 4)) / Math.pow(10, 4);
      case 'contentHash':
      default:
        return param.value;
    }
  }

  match(string: string): MatchResponse<MatchResult> | null {
    const result = string.match(/\$\{([^}]+)\}/);

    if (!result) {
      return null;
    }

    return {
      index: result.index!,
      length: result[0].length,
      match: result[0],
      valid: true,
      matchedParam: result[1],
    };
  }

  replaceWith(_: ChildrenNode, props: MatchResult): Node {
    const paramName = props.matchedParam;
    const param = this.options.params?.find(param => param.name === paramName);

    return <span {...props}>{this.renderByParamType(param)}</span>;
  }

  asTag(): string {
    return 'span';
  }
}

export default GenericCallParamsMatcher;
