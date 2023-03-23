import * as React from 'react';
import classNames from 'classnames';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
const Divider = props => (
  <ConfigConsumer>
    {({ getPrefixCls }) => {
      const {
        prefixCls: customizePrefixCls,
        type = 'horizontal',
        orientation = 'center',
        className,
        children,
        dashed,
        ...restProps
      } = props;
      const prefixCls = getPrefixCls('divider', customizePrefixCls);
      const orientationPrefix = orientation.length > 0 ? `-${orientation}` : orientation;
      const classString = classNames(className, prefixCls, `${prefixCls}-${type}`, {
        [`${prefixCls}-with-text${orientationPrefix}`]: children,
        [`${prefixCls}-dashed`]: !!dashed,
      });
      return (
        <div className={classString} {...restProps} role="separator">
          {children && <span className={`${prefixCls}-inner-text`}>{children}</span>}
        </div>
      );
    }}
  </ConfigConsumer>
);
export default Divider;
