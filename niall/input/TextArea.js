import * as React from 'react';
import { polyfill } from 'react-lifecycles-compat';
import ClearableLabeledInput from './ClearableLabeledInput';
import ResizableTextArea, { AutoSizeType } from './ResizableTextArea';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import { fixControlledValue, resolveOnChange } from './Input';
class TextArea extends React.Component {
  constructor(props) {
    super(props);
    const value = typeof props.value === 'undefined' ? props.defaultValue : props.value;
    this.state = {
      value,
    };
  }
  static getDerivedStateFromProps(nextProps) {
    if ('value' in nextProps) {
      return {
        value: nextProps.value,
      };
    }
    return null;
  }
  setValue(value, callback) {
    if (!('value' in this.props)) {
      this.setState(
        {
          value,
        },
        callback,
      );
    }
  }
  focus() {
    this.resizableTextArea.textArea.focus();
  }
  blur() {
    this.resizableTextArea.textArea.blur();
  }
  saveTextArea = resizableTextArea => {
    this.resizableTextArea = resizableTextArea;
  };
  saveClearableInput = clearableInput => {
    this.clearableInput = clearableInput;
  };
  handleChange = e => {
    this.setValue(e.target.value, () => {
      this.resizableTextArea.resizeTextarea();
    });
    resolveOnChange(this.resizableTextArea.textArea, e, this.props.onChange);
  };
  handleKeyDown = e => {
    const { onPressEnter, onKeyDown } = this.props;
    if (e.keyCode === 13 && onPressEnter) {
      onPressEnter(e);
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };
  handleReset = e => {
    this.setValue('', () => {
      this.resizableTextArea.renderTextArea();
      this.focus();
    });
    resolveOnChange(this.resizableTextArea.textArea, e, this.props.onChange);
  };
  renderTextArea = prefixCls => {
    return (
      <ResizableTextArea
        {...this.props}
        prefixCls={prefixCls}
        onKeyDown={this.handleKeyDown}
        onChange={this.handleChange}
        ref={this.saveTextArea}
      />
    );
  };
  renderComponent = ({ getPrefixCls }) => {
    const { value } = this.state;
    const { prefixCls: customizePrefixCls } = this.props;
    const prefixCls = getPrefixCls('input', customizePrefixCls);
    return (
      <ClearableLabeledInput
        {...this.props}
        prefixCls={prefixCls}
        inputType="text"
        value={fixControlledValue(value)}
        element={this.renderTextArea(prefixCls)}
        handleReset={this.handleReset}
        ref={this.saveClearableInput}
      />
    );
  };
  render() {
    return <ConfigConsumer>{this.renderComponent}</ConfigConsumer>;
  }
}
polyfill(TextArea);
export default TextArea;
