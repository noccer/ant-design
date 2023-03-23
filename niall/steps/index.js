import * as React from 'react';
import * as PropTypes from 'prop-types';
import RcSteps from 'rc-steps';
import Icon from '../icon';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
export default class Steps extends React.Component {
  static Step = RcSteps.Step;
  static defaultProps = {
    current: 0,
  };
  static propTypes = {
    prefixCls: PropTypes.string,
    iconPrefix: PropTypes.string,
    current: PropTypes.number,
  };
  renderSteps = ({ getPrefixCls }) => {
    const prefixCls = getPrefixCls('steps', this.props.prefixCls);
    const iconPrefix = getPrefixCls('', this.props.iconPrefix);
    const icons = {
      finish: <Icon type="check" className={`${prefixCls}-finish-icon`} />,
      error: <Icon type="close" className={`${prefixCls}-error-icon`} />,
    };
    return <RcSteps icons={icons} {...this.props} prefixCls={prefixCls} iconPrefix={iconPrefix} />;
  };
  render() {
    return <ConfigConsumer>{this.renderSteps}</ConfigConsumer>;
  }
}
