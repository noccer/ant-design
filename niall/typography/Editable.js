import * as React from 'react';
import KeyCode from 'rc-util/lib/KeyCode';
import classNames from 'classnames';
import { polyfill } from 'react-lifecycles-compat';
import Icon from '../icon';
import TextArea from '../input/TextArea';
class Editable extends React.Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    const { prevValue } = prevState;
    const { value } = nextProps;
    const newState = {
      prevValue: value,
    };
    if (prevValue !== value) {
      newState.current = value;
    }
    return newState;
  }
  inComposition = false;
  state = {
    current: '',
  };
  componentDidMount() {
    if (this.textarea && this.textarea.resizableTextArea) {
      const { textArea } = this.textarea.resizableTextArea;
      textArea.focus();
      const { length } = textArea.value;
      textArea.setSelectionRange(length, length);
    }
  }
  onChange = ({ target: { value } }) => {
    this.setState({
      current: value.replace(/[\r\n]/g, ''),
    });
  };
  onCompositionStart = () => {
    this.inComposition = true;
  };
  onCompositionEnd = () => {
    this.inComposition = false;
  };
  onKeyDown = ({ keyCode }) => {
    // We don't record keyCode when IME is using
    if (this.inComposition) return;
    this.lastKeyCode = keyCode;
  };
  onKeyUp = ({ keyCode, ctrlKey, altKey, metaKey, shiftKey }) => {
    const { onCancel } = this.props;
    // Check if it's a real key
    if (
      this.lastKeyCode === keyCode &&
      !this.inComposition &&
      !ctrlKey &&
      !altKey &&
      !metaKey &&
      !shiftKey
    ) {
      if (keyCode === KeyCode.ENTER) {
        this.confirmChange();
      } else if (keyCode === KeyCode.ESC) {
        onCancel();
      }
    }
  };
  onBlur = () => {
    this.confirmChange();
  };
  confirmChange = () => {
    const { current } = this.state;
    const { onSave } = this.props;
    onSave(current.trim());
  };
  setTextarea = textarea => {
    this.textarea = textarea;
  };
  render() {
    const { current } = this.state;
    const { prefixCls, 'aria-label': ariaLabel, className, style } = this.props;
    return (
      <div className={classNames(prefixCls, `${prefixCls}-edit-content`, className)} style={style}>
        <TextArea
          ref={this.setTextarea}
          value={current}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          onKeyUp={this.onKeyUp}
          onCompositionStart={this.onCompositionStart}
          onCompositionEnd={this.onCompositionEnd}
          onBlur={this.onBlur}
          aria-label={ariaLabel}
          autoSize
        />
        <Icon type="enter" className={`${prefixCls}-edit-content-confirm`} />
      </div>
    );
  }
}
polyfill(Editable);
export default Editable;
