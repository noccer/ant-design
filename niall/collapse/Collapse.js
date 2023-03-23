import * as React from 'react';
import RcCollapse from 'rc-collapse';
import classNames from 'classnames';
import CollapsePanel from './CollapsePanel';
import Icon from '../icon';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import animation from '../_util/openAnimation';
export default class Collapse extends React.Component {
  static Panel = CollapsePanel;
  static defaultProps = {
    bordered: true,
    openAnimation: {
      ...animation,
      appear() {},
    },
    expandIconPosition: 'left',
  };
  renderExpandIcon = (panelProps = {}, prefixCls) => {
    const { expandIcon } = this.props;
    const icon = expandIcon ? (
      expandIcon(panelProps)
    ) : (
      <Icon type="right" rotate={panelProps.isActive ? 90 : undefined} />
    );
    return React.isValidElement(icon)
      ? React.cloneElement(icon, {
          className: classNames(icon.props.className, `${prefixCls}-arrow`),
        })
      : icon;
  };
  renderCollapse = ({ getPrefixCls }) => {
    const {
      prefixCls: customizePrefixCls,
      className = '',
      bordered,
      expandIconPosition,
    } = this.props;
    const prefixCls = getPrefixCls('collapse', customizePrefixCls);
    const collapseClassName = classNames(
      {
        [`${prefixCls}-borderless`]: !bordered,
        [`${prefixCls}-icon-position-${expandIconPosition}`]: true,
      },
      className,
    );
    return (
      <RcCollapse
        {...this.props}
        expandIcon={panelProps => this.renderExpandIcon(panelProps, prefixCls)}
        prefixCls={prefixCls}
        className={collapseClassName}
      />
    );
  };
  render() {
    return <ConfigConsumer>{this.renderCollapse}</ConfigConsumer>;
  }
}
