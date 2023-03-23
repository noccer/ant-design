import * as React from 'react';
import classNames from 'classnames';
import omit from 'omit.js';
import { polyfill } from 'react-lifecycles-compat';
import Icon from '../icon';
import CheckableTag from './CheckableTag';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import { PresetColorTypes } from '../_util/colors';
import warning from '../_util/warning';
import Wave from '../_util/wave';
export { CheckableTagProps } from './CheckableTag';
const PresetColorRegex = new RegExp(`^(${PresetColorTypes.join('|')})(-inverse)?$`);
class Tag extends React.Component {
  static CheckableTag = CheckableTag;
  static defaultProps = {
    closable: false,
  };
  static getDerivedStateFromProps(nextProps) {
    if ('visible' in nextProps) {
      return {
        visible: nextProps.visible,
      };
    }
    return null;
  }
  state = {
    visible: true,
  };
  constructor(props) {
    super(props);
    warning(
      !('afterClose' in props),
      'Tag',
      "'afterClose' will be deprecated, please use 'onClose', we will remove this in the next version.",
    );
  }
  getTagStyle() {
    const { color, style } = this.props;
    const isPresetColor = this.isPresetColor();
    return {
      backgroundColor: color && !isPresetColor ? color : undefined,
      ...style,
    };
  }
  getTagClassName({ getPrefixCls }) {
    const { prefixCls: customizePrefixCls, className, color } = this.props;
    const { visible } = this.state;
    const isPresetColor = this.isPresetColor();
    const prefixCls = getPrefixCls('tag', customizePrefixCls);
    return classNames(
      prefixCls,
      {
        [`${prefixCls}-${color}`]: isPresetColor,
        [`${prefixCls}-has-color`]: color && !isPresetColor,
        [`${prefixCls}-hidden`]: !visible,
      },
      className,
    );
  }
  setVisible(visible, e) {
    const { onClose, afterClose } = this.props;
    if (onClose) {
      onClose(e);
    }
    if (afterClose && !onClose) {
      // next version remove.
      afterClose();
    }
    if (e.defaultPrevented) {
      return;
    }
    if (!('visible' in this.props)) {
      this.setState({
        visible,
      });
    }
  }
  handleIconClick = e => {
    e.stopPropagation();
    this.setVisible(false, e);
  };
  isPresetColor() {
    const { color } = this.props;
    if (!color) {
      return false;
    }
    return PresetColorRegex.test(color);
  }
  renderCloseIcon() {
    const { closable } = this.props;
    return closable ? <Icon type="close" onClick={this.handleIconClick} /> : null;
  }
  renderTag = configProps => {
    const { children, ...otherProps } = this.props;
    const isNeedWave = 'onClick' in otherProps || (children && children.type === 'a');
    const tagProps = omit(otherProps, [
      'onClose',
      'afterClose',
      'color',
      'visible',
      'closable',
      'prefixCls',
    ]);
    return isNeedWave ? (
      <Wave>
        <span
          {...tagProps}
          className={this.getTagClassName(configProps)}
          style={this.getTagStyle()}
        >
          {children}
          {this.renderCloseIcon()}
        </span>
      </Wave>
    ) : (
      <span {...tagProps} className={this.getTagClassName(configProps)} style={this.getTagStyle()}>
        {children}
        {this.renderCloseIcon()}
      </span>
    );
  };
  render() {
    return <ConfigConsumer>{this.renderTag}</ConfigConsumer>;
  }
}
polyfill(Tag);
export default Tag;
