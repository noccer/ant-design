import * as React from 'react';
import classNames from 'classnames';
import Button from '../button';
import { ButtonHTMLType } from '../button/button';
import { ButtonGroupProps } from '../button/button-group';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import Dropdown, { DropDownProps } from './dropdown';
import Icon from '../icon';
const ButtonGroup = Button.Group;
export default class DropdownButton extends React.Component {
  static defaultProps = {
    placement: 'bottomRight',
    type: 'default',
  };
  renderButton = ({ getPopupContainer: getContextPopupContainer, getPrefixCls }) => {
    const {
      prefixCls: customizePrefixCls,
      type,
      disabled,
      onClick,
      htmlType,
      children,
      className,
      overlay,
      trigger,
      align,
      visible,
      onVisibleChange,
      placement,
      getPopupContainer,
      href,
      icon = <Icon type="ellipsis" />,
      title,
      ...restProps
    } = this.props;
    const prefixCls = getPrefixCls('dropdown-button', customizePrefixCls);
    const dropdownProps = {
      align,
      overlay,
      disabled,
      trigger: disabled ? [] : trigger,
      onVisibleChange,
      placement,
      getPopupContainer: getPopupContainer || getContextPopupContainer,
    };
    if ('visible' in this.props) {
      dropdownProps.visible = visible;
    }
    return (
      <ButtonGroup {...restProps} className={classNames(prefixCls, className)}>
        <Button
          type={type}
          disabled={disabled}
          onClick={onClick}
          htmlType={htmlType}
          href={href}
          title={title}
        >
          {children}
        </Button>
        <Dropdown {...dropdownProps}>
          <Button type={type}>{icon}</Button>
        </Dropdown>
      </ButtonGroup>
    );
  };
  render() {
    return <ConfigConsumer>{this.renderButton}</ConfigConsumer>;
  }
}
