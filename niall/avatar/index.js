import * as React from 'react';
import classNames from 'classnames';
import Icon from '../icon';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
export default class Avatar extends React.Component {
  static defaultProps = {
    shape: 'circle',
    size: 'default',
  };
  state = {
    scale: 1,
    mounted: false,
    isImgExist: true,
  };
  componentDidMount() {
    this.setScale();
    this.setState({
      mounted: true,
    });
  }
  componentDidUpdate(prevProps) {
    this.setScale();
    if (prevProps.src !== this.props.src) {
      this.setState({
        isImgExist: true,
        scale: 1,
      });
    }
  }
  setScale = () => {
    if (!this.avatarChildren || !this.avatarNode) {
      return;
    }
    const childrenWidth = this.avatarChildren.offsetWidth; // offsetWidth avoid affecting be transform scale
    const nodeWidth = this.avatarNode.offsetWidth;
    // denominator is 0 is no meaning
    if (
      childrenWidth === 0 ||
      nodeWidth === 0 ||
      (this.lastChildrenWidth === childrenWidth && this.lastNodeWidth === nodeWidth)
    ) {
      return;
    }
    this.lastChildrenWidth = childrenWidth;
    this.lastNodeWidth = nodeWidth;
    // add 4px gap for each side to get better performance
    this.setState({
      scale: nodeWidth - 8 < childrenWidth ? (nodeWidth - 8) / childrenWidth : 1,
    });
  };
  handleImgLoadError = () => {
    const { onError } = this.props;
    const errorFlag = onError ? onError() : undefined;
    if (errorFlag !== false) {
      this.setState({
        isImgExist: false,
      });
    }
  };
  renderAvatar = ({ getPrefixCls }) => {
    const {
      prefixCls: customizePrefixCls,
      shape,
      size,
      src,
      srcSet,
      icon,
      className,
      alt,
      ...others
    } = this.props;
    const { isImgExist, scale, mounted } = this.state;
    const prefixCls = getPrefixCls('avatar', customizePrefixCls);
    const sizeCls = classNames({
      [`${prefixCls}-lg`]: size === 'large',
      [`${prefixCls}-sm`]: size === 'small',
    });
    const classString = classNames(prefixCls, className, sizeCls, {
      [`${prefixCls}-${shape}`]: shape,
      [`${prefixCls}-image`]: src && isImgExist,
      [`${prefixCls}-icon`]: icon,
    });
    const sizeStyle =
      typeof size === 'number'
        ? {
            width: size,
            height: size,
            lineHeight: `${size}px`,
            fontSize: icon ? size / 2 : 18,
          }
        : {};
    let { children } = this.props;
    if (src && isImgExist) {
      children = <img src={src} srcSet={srcSet} onError={this.handleImgLoadError} alt={alt} />;
    } else if (icon) {
      if (typeof icon === 'string') {
        children = <Icon type={icon} />;
      } else {
        children = icon;
      }
    } else {
      const childrenNode = this.avatarChildren;
      if (childrenNode || scale !== 1) {
        const transformString = `scale(${scale}) translateX(-50%)`;
        const childrenStyle = {
          msTransform: transformString,
          WebkitTransform: transformString,
          transform: transformString,
        };
        const sizeChildrenStyle =
          typeof size === 'number'
            ? {
                lineHeight: `${size}px`,
              }
            : {};
        children = (
          <span
            className={`${prefixCls}-string`}
            ref={node => (this.avatarChildren = node)}
            style={{
              ...sizeChildrenStyle,
              ...childrenStyle,
            }}
          >
            {children}
          </span>
        );
      } else {
        const childrenStyle = {};
        if (!mounted) {
          childrenStyle.opacity = 0;
        }
        children = (
          <span
            className={`${prefixCls}-string`}
            style={{
              opacity: 0,
            }}
            ref={node => (this.avatarChildren = node)}
          >
            {children}
          </span>
        );
      }
    }
    return (
      <span
        {...others}
        style={{
          ...sizeStyle,
          ...others.style,
        }}
        className={classString}
        ref={node => (this.avatarNode = node)}
      >
        {children}
      </span>
    );
  };
  render() {
    return <ConfigConsumer>{this.renderAvatar}</ConfigConsumer>;
  }
}
