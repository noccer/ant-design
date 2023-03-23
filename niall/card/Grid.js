import * as React from 'react';
import classNames from 'classnames';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
const Grid = props => (
  <ConfigConsumer>
    {({ getPrefixCls }) => {
      const { prefixCls: customizePrefixCls, className, hoverable = true, ...others } = props;
      const prefixCls = getPrefixCls('card', customizePrefixCls);
      const classString = classNames(`${prefixCls}-grid`, className, {
        [`${prefixCls}-grid-hoverable`]: hoverable,
      });
      return <div {...others} className={classString} />;
    }}
  </ConfigConsumer>
);
export default Grid;
