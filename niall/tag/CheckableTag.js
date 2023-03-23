import * as React from 'react';
import classNames from 'classnames';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
export default class CheckableTag extends React.Component {
  handleClick = () => {
    const { checked, onChange } = this.props;
    if (onChange) {
      onChange(!checked);
    }
  };
  renderCheckableTag = ({ getPrefixCls }) => {
    const { prefixCls: customizePrefixCls, className, checked, ...restProps } = this.props;
    const prefixCls = getPrefixCls('tag', customizePrefixCls);
    const cls = classNames(
      prefixCls,
      {
        [`${prefixCls}-checkable`]: true,
        [`${prefixCls}-checkable-checked`]: checked,
      },
      className,
    );
    delete restProps.onChange; // TypeScript cannot check delete now.
    return <span {...restProps} className={cls} onClick={this.handleClick} />;
  };
  render() {
    return <ConfigConsumer>{this.renderCheckableTag}</ConfigConsumer>;
  }
}
