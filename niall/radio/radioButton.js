import * as React from 'react';
import * as PropTypes from 'prop-types';
import Radio from './radio';
import { RadioChangeEvent } from './interface';
import { AbstractCheckboxProps } from '../checkbox/Checkbox';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
export default class RadioButton extends React.Component {
  static contextTypes = {
    radioGroup: PropTypes.any,
  };
  renderRadioButton = ({ getPrefixCls }) => {
    const { prefixCls: customizePrefixCls, ...radioProps } = this.props;
    const prefixCls = getPrefixCls('radio-button', customizePrefixCls);
    if (this.context.radioGroup) {
      radioProps.checked = this.props.value === this.context.radioGroup.value;
      radioProps.disabled = this.props.disabled || this.context.radioGroup.disabled;
    }
    return <Radio prefixCls={prefixCls} {...radioProps} />;
  };
  render() {
    return <ConfigConsumer>{this.renderRadioButton}</ConfigConsumer>;
  }
}
