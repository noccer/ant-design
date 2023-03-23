import * as React from 'react';
import classNames from 'classnames';
// eslint-disable-next-line react/prefer-stateless-function
class SkeletonAvatar extends React.Component {
  static defaultProps = {
    size: 'large',
  };
  render() {
    const { prefixCls, className, style, size, shape } = this.props;
    const sizeCls = classNames({
      [`${prefixCls}-lg`]: size === 'large',
      [`${prefixCls}-sm`]: size === 'small',
    });
    const shapeCls = classNames({
      [`${prefixCls}-circle`]: shape === 'circle',
      [`${prefixCls}-square`]: shape === 'square',
    });
    const sizeStyle =
      typeof size === 'number'
        ? {
            width: size,
            height: size,
            lineHeight: `${size}px`,
          }
        : {};
    return (
      <span
        className={classNames(prefixCls, className, sizeCls, shapeCls)}
        style={{
          ...sizeStyle,
          ...style,
        }}
      />
    );
  }
}
export default SkeletonAvatar;
