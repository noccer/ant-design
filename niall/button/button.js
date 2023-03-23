/* eslint-disable react/button-has-type */
import * as React from 'react';
import * as PropTypes from 'prop-types';
import classNames from 'classnames';
import { polyfill } from 'react-lifecycles-compat';
import omit from 'omit.js';
import Group from './button-group';
import Icon from '../icon';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import Wave from '../_util/wave';
import { Omit, tuple } from '../_util/type';
const rxTwoCNChar = /^[\u4e00-\u9fa5]{2}$/;
const isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);
function isString(str) {
  return typeof str === 'string';
}

// Insert one space between two chinese characters automatically.
function insertSpace(child, needInserted) {
  // Check the child if is undefined or null.
  if (child == null) {
    return;
  }
  const SPACE = needInserted ? ' ' : '';
  // strictNullChecks oops.
  if (
    typeof child !== 'string' &&
    typeof child !== 'number' &&
    isString(child.type) &&
    isTwoCNChar(child.props.children)
  ) {
    return React.cloneElement(child, {}, child.props.children.split('').join(SPACE));
  }
  if (typeof child === 'string') {
    if (isTwoCNChar(child)) {
      child = child.split('').join(SPACE);
    }
    return <span>{child}</span>;
  }
  return child;
}
function spaceChildren(children, needInserted) {
  let isPrevChildPure = false;
  const childList = [];
  React.Children.forEach(children, child => {
    const type = typeof child;
    const isCurrentChildPure = type === 'string' || type === 'number';
    if (isPrevChildPure && isCurrentChildPure) {
      const lastIndex = childList.length - 1;
      const lastChild = childList[lastIndex];
      childList[lastIndex] = `${lastChild}${child}`;
    } else {
      childList.push(child);
    }
    isPrevChildPure = isCurrentChildPure;
  });

  // Pass to React.Children.map to auto fill key
  return React.Children.map(childList, child => insertSpace(child, needInserted));
}
const ButtonTypes = tuple('default', 'primary', 'ghost', 'dashed', 'danger', 'link');
const ButtonShapes = tuple('circle', 'circle-outline', 'round');
const ButtonSizes = tuple('large', 'default', 'small');
const ButtonHTMLTypes = tuple('submit', 'button', 'reset');
class Button extends React.Component {
  static __ANT_BUTTON = true;
  static defaultProps = {
    loading: false,
    ghost: false,
    block: false,
    htmlType: 'button',
  };
  static propTypes = {
    type: PropTypes.string,
    shape: PropTypes.oneOf(ButtonShapes),
    size: PropTypes.oneOf(ButtonSizes),
    htmlType: PropTypes.oneOf(ButtonHTMLTypes),
    onClick: PropTypes.func,
    loading: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    className: PropTypes.string,
    icon: PropTypes.string,
    block: PropTypes.bool,
    title: PropTypes.string,
  };
  constructor(props) {
    super(props);
    this.state = {
      loading: props.loading,
      hasTwoCNChar: false,
    };
  }
  componentDidMount() {
    this.fixTwoCNChar();
  }
  componentDidUpdate(prevProps) {
    this.fixTwoCNChar();
    if (prevProps.loading && typeof prevProps.loading !== 'boolean') {
      clearTimeout(this.delayTimeout);
    }
    const { loading } = this.props;
    if (loading && typeof loading !== 'boolean' && loading.delay) {
      this.delayTimeout = window.setTimeout(() => {
        this.setState({
          loading,
        });
      }, loading.delay);
    } else if (prevProps.loading !== loading) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        loading,
      });
    }
  }
  componentWillUnmount() {
    if (this.delayTimeout) {
      clearTimeout(this.delayTimeout);
    }
  }
  saveButtonRef = node => {
    this.buttonNode = node;
  };
  handleClick = e => {
    const { loading } = this.state;
    const { onClick } = this.props;
    if (loading) {
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };
  fixTwoCNChar() {
    // Fix for HOC usage like <FormatMessage />
    if (!this.buttonNode) {
      return;
    }
    const buttonText = this.buttonNode.textContent;
    if (this.isNeedInserted() && isTwoCNChar(buttonText)) {
      if (!this.state.hasTwoCNChar) {
        this.setState({
          hasTwoCNChar: true,
        });
      }
    } else if (this.state.hasTwoCNChar) {
      this.setState({
        hasTwoCNChar: false,
      });
    }
  }
  isNeedInserted() {
    const { icon, children, type } = this.props;
    return React.Children.count(children) === 1 && !icon && type !== 'link';
  }
  renderButton = ({ getPrefixCls, autoInsertSpaceInButton }) => {
    const {
      prefixCls: customizePrefixCls,
      type,
      shape,
      size,
      className,
      children,
      icon,
      ghost,
      block,
      ...rest
    } = this.props;
    const { loading, hasTwoCNChar } = this.state;
    const prefixCls = getPrefixCls('btn', customizePrefixCls);
    const autoInsertSpace = autoInsertSpaceInButton !== false;

    // large => lg
    // small => sm
    let sizeCls = '';
    switch (size) {
      case 'large':
        sizeCls = 'lg';
        break;
      case 'small':
        sizeCls = 'sm';
        break;
      default:
        break;
    }
    const iconType = loading ? 'loading' : icon;
    const classes = classNames(prefixCls, className, {
      [`${prefixCls}-${type}`]: type,
      [`${prefixCls}-${shape}`]: shape,
      [`${prefixCls}-${sizeCls}`]: sizeCls,
      [`${prefixCls}-icon-only`]: !children && children !== 0 && iconType,
      [`${prefixCls}-loading`]: !!loading,
      [`${prefixCls}-background-ghost`]: ghost,
      [`${prefixCls}-two-chinese-chars`]: hasTwoCNChar && autoInsertSpace,
      [`${prefixCls}-block`]: block,
    });
    const iconNode = iconType ? <Icon type={iconType} /> : null;
    const kids =
      children || children === 0
        ? spaceChildren(children, this.isNeedInserted() && autoInsertSpace)
        : null;
    const linkButtonRestProps = omit(rest, ['htmlType', 'loading']);
    if (linkButtonRestProps.href !== undefined) {
      return (
        <a
          {...linkButtonRestProps}
          className={classes}
          onClick={this.handleClick}
          ref={this.saveButtonRef}
        >
          {iconNode}
          {kids}
        </a>
      );
    }

    // React does not recognize the `htmlType` prop on a DOM element. Here we pick it out of `rest`.
    const { htmlType, ...otherProps } = rest;
    const buttonNode = (
      <button
        {...omit(otherProps, ['loading'])}
        type={htmlType}
        className={classes}
        onClick={this.handleClick}
        ref={this.saveButtonRef}
      >
        {iconNode}
        {kids}
      </button>
    );
    if (type === 'link') {
      return buttonNode;
    }
    return <Wave>{buttonNode}</Wave>;
  };
  render() {
    return <ConfigConsumer>{this.renderButton}</ConfigConsumer>;
  }
}
polyfill(Button);
export default Button;
