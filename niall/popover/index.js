import * as React from 'react';
import Tooltip, { AbstractTooltipProps, TooltipPlacement, TooltipTrigger } from '../tooltip';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import warning from '../_util/warning';
export default class Popover extends React.Component {
  static defaultProps = {
    placement: 'top',
    transitionName: 'zoom-big',
    trigger: 'hover',
    mouseEnterDelay: 0.1,
    mouseLeaveDelay: 0.1,
    overlayStyle: {},
  };
  getPopupDomNode() {
    return this.tooltip.getPopupDomNode();
  }
  getOverlay(prefixCls) {
    const { title, content } = this.props;
    warning(
      !('overlay' in this.props),
      'Popover',
      '`overlay` is removed, please use `content` instead, ' +
        'see: https://u.ant.design/popover-content',
    );
    return (
      <div>
        {title && <div className={`${prefixCls}-title`}>{title}</div>}
        <div className={`${prefixCls}-inner-content`}>{content}</div>
      </div>
    );
  }
  saveTooltip = node => {
    this.tooltip = node;
  };
  renderPopover = ({ getPrefixCls }) => {
    const { prefixCls: customizePrefixCls, ...props } = this.props;
    delete props.title;
    const prefixCls = getPrefixCls('popover', customizePrefixCls);
    return (
      <Tooltip
        {...props}
        prefixCls={prefixCls}
        ref={this.saveTooltip}
        overlay={this.getOverlay(prefixCls)}
      />
    );
  };
  render() {
    return <ConfigConsumer>{this.renderPopover}</ConfigConsumer>;
  }
}
