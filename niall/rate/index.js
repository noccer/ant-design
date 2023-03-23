import * as React from 'react';
import * as PropTypes from 'prop-types';
import RcRate from 'rc-rate';
import omit from 'omit.js';
import Icon from '../icon';
import Tooltip from '../tooltip';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
export default class Rate extends React.Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    character: PropTypes.node,
  };
  static defaultProps = {
    character: <Icon type="star" theme="filled" />,
  };
  saveRate = node => {
    this.rcRate = node;
  };
  characterRender = (node, { index }) => {
    const { tooltips } = this.props;
    if (!tooltips) return node;
    return <Tooltip title={tooltips[index]}>{node}</Tooltip>;
  };
  focus() {
    this.rcRate.focus();
  }
  blur() {
    this.rcRate.blur();
  }
  renderRate = ({ getPrefixCls }) => {
    const { prefixCls, ...restProps } = this.props;
    const rateProps = omit(restProps, ['tooltips']);
    return (
      <RcRate
        ref={this.saveRate}
        characterRender={this.characterRender}
        {...rateProps}
        prefixCls={getPrefixCls('rate', prefixCls)}
      />
    );
  };
  render() {
    return <ConfigConsumer>{this.renderRate}</ConfigConsumer>;
  }
}
