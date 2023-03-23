import * as React from 'react';
import classnames from 'classnames';
import { ConfigConsumerProps, ConfigConsumer } from '../config-provider';
import Icon from '../icon';
import noFound from './noFound';
import serverError from './serverError';
import unauthorized from './unauthorized';
export const IconMap = {
  success: 'check-circle',
  error: 'close-circle',
  info: 'exclamation-circle',
  warning: 'warning',
};
export const ExceptionMap = {
  '404': noFound,
  '500': serverError,
  '403': unauthorized,
};
// ExceptionImageMap keys
const ExceptionStatus = Object.keys(ExceptionMap);

/**
 * render icon
 * if ExceptionStatus includes ,render svg image
 * else render iconNode
 * @param prefixCls
 * @param {status, icon}
 */
const renderIcon = (prefixCls, { status, icon }) => {
  const className = classnames(`${prefixCls}-icon`);
  if (ExceptionStatus.includes(`${status}`)) {
    const SVGComponent = ExceptionMap[status];
    return (
      <div className={`${className} ${prefixCls}-image`}>
        <SVGComponent />
      </div>
    );
  }
  const iconString = IconMap[status];
  const iconNode = icon || <Icon type={iconString} theme="filled" />;
  return <div className={className}>{iconNode}</div>;
};
const renderExtra = (prefixCls, { extra }) =>
  extra && <div className={`${prefixCls}-extra`}>{extra}</div>;
const Result = props => (
  <ConfigConsumer>
    {({ getPrefixCls }) => {
      const {
        prefixCls: customizePrefixCls,
        className: customizeClassName,
        subTitle,
        title,
        style,
        children,
        status,
      } = props;
      const prefixCls = getPrefixCls('result', customizePrefixCls);
      const className = classnames(prefixCls, `${prefixCls}-${status}`, customizeClassName);
      return (
        <div className={className} style={style}>
          {renderIcon(prefixCls, props)}
          <div className={`${prefixCls}-title`}>{title}</div>
          {subTitle && <div className={`${prefixCls}-subtitle`}>{subTitle}</div>}
          {children && <div className={`${prefixCls}-content`}>{children}</div>}
          {renderExtra(prefixCls, props)}
        </div>
      );
    }}
  </ConfigConsumer>
);
Result.defaultProps = {
  status: 'info',
};
Result.PRESENTED_IMAGE_403 = ExceptionMap[403];
Result.PRESENTED_IMAGE_404 = ExceptionMap[404];
Result.PRESENTED_IMAGE_500 = ExceptionMap[500];
export default Result;
