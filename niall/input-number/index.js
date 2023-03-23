import * as React from 'react';
import classNames from 'classnames';
import RcInputNumber from 'rc-input-number';
import Icon from '../icon';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import { Omit } from '../_util/type';

// omitting this attrs because they conflicts with the ones defined in InputNumberProps

export default class InputNumber extends React.Component {
  static defaultProps = {
    step: 1,
  };
  saveInputNumber = inputNumberRef => {
    this.inputNumberRef = inputNumberRef;
  };
  focus() {
    this.inputNumberRef.focus();
  }
  blur() {
    this.inputNumberRef.blur();
  }
  renderInputNumber = ({ getPrefixCls }) => {
    const { className, size, prefixCls: customizePrefixCls, ...others } = this.props;
    const prefixCls = getPrefixCls('input-number', customizePrefixCls);
    const inputNumberClass = classNames(
      {
        [`${prefixCls}-lg`]: size === 'large',
        [`${prefixCls}-sm`]: size === 'small',
      },
      className,
    );
    const upIcon = <Icon type="up" className={`${prefixCls}-handler-up-inner`} />;
    const downIcon = <Icon type="down" className={`${prefixCls}-handler-down-inner`} />;
    return (
      <RcInputNumber
        ref={this.saveInputNumber}
        className={inputNumberClass}
        upHandler={upIcon}
        downHandler={downIcon}
        prefixCls={prefixCls}
        {...others}
      />
    );
  };
  render() {
    return <ConfigConsumer>{this.renderInputNumber}</ConfigConsumer>;
  }
}
