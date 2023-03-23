import * as React from 'react';
import { polyfill } from 'react-lifecycles-compat';
import Tooltip, { AbstractTooltipProps } from '../tooltip';
import Icon from '../icon';
import Button from '../button';
import { ButtonType, NativeButtonProps } from '../button/button';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import defaultLocale from '../locale/default';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
class Popconfirm extends React.Component {
  static defaultProps = {
    transitionName: 'zoom-big',
    placement: 'top',
    trigger: 'click',
    okType: 'primary',
    icon: <Icon type="exclamation-circle" theme="filled" />,
    disabled: false,
  };
  static getDerivedStateFromProps(nextProps) {
    if ('visible' in nextProps) {
      return {
        visible: nextProps.visible,
      };
    }
    if ('defaultVisible' in nextProps) {
      return {
        visible: nextProps.defaultVisible,
      };
    }
    return null;
  }
  constructor(props) {
    super(props);
    this.state = {
      visible: props.visible,
    };
  }
  getPopupDomNode() {
    return this.tooltip.getPopupDomNode();
  }
  onConfirm = e => {
    this.setVisible(false, e);
    const { onConfirm } = this.props;
    if (onConfirm) {
      onConfirm.call(this, e);
    }
  };
  onCancel = e => {
    this.setVisible(false, e);
    const { onCancel } = this.props;
    if (onCancel) {
      onCancel.call(this, e);
    }
  };
  onVisibleChange = visible => {
    const { disabled } = this.props;
    if (disabled) {
      return;
    }
    this.setVisible(visible);
  };
  setVisible(visible, e) {
    const { props } = this;
    if (!('visible' in props)) {
      this.setState({
        visible,
      });
    }
    const { onVisibleChange } = props;
    if (onVisibleChange) {
      onVisibleChange(visible, e);
    }
  }
  saveTooltip = node => {
    this.tooltip = node;
  };
  renderOverlay = (prefixCls, popconfirmLocale) => {
    const {
      okButtonProps,
      cancelButtonProps,
      title,
      cancelText,
      okText,
      okType,
      icon,
    } = this.props;
    return (
      <div>
        <div className={`${prefixCls}-inner-content`}>
          <div className={`${prefixCls}-message`}>
            {icon}
            <div className={`${prefixCls}-message-title`}>{title}</div>
          </div>
          <div className={`${prefixCls}-buttons`}>
            <Button onClick={this.onCancel} size="small" {...cancelButtonProps}>
              {cancelText || popconfirmLocale.cancelText}
            </Button>
            <Button onClick={this.onConfirm} type={okType} size="small" {...okButtonProps}>
              {okText || popconfirmLocale.okText}
            </Button>
          </div>
        </div>
      </div>
    );
  };
  renderConfirm = ({ getPrefixCls }) => {
    const { prefixCls: customizePrefixCls, placement, ...restProps } = this.props;
    const prefixCls = getPrefixCls('popover', customizePrefixCls);
    const overlay = (
      <LocaleReceiver componentName="Popconfirm" defaultLocale={defaultLocale.Popconfirm}>
        {popconfirmLocale => this.renderOverlay(prefixCls, popconfirmLocale)}
      </LocaleReceiver>
    );
    return (
      <Tooltip
        {...restProps}
        prefixCls={prefixCls}
        placement={placement}
        onVisibleChange={this.onVisibleChange}
        visible={this.state.visible}
        overlay={overlay}
        ref={this.saveTooltip}
      />
    );
  };
  render() {
    return <ConfigConsumer>{this.renderConfirm}</ConfigConsumer>;
  }
}
polyfill(Popconfirm);
export default Popconfirm;
