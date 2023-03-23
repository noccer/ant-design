import * as React from 'react';
import classNames from 'classnames';
import { ButtonSize } from './button';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
const ButtonGroup = props => (
  <ConfigConsumer>
    {({ getPrefixCls }) => {
      const { prefixCls: customizePrefixCls, size, className, ...others } = props;
      const prefixCls = getPrefixCls('btn-group', customizePrefixCls);

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
      const classes = classNames(
        prefixCls,
        {
          [`${prefixCls}-${sizeCls}`]: sizeCls,
        },
        className,
      );
      return <div {...others} className={classes} />;
    }}
  </ConfigConsumer>
);
export default ButtonGroup;
