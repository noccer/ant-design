/**
 * Wrap of sub component which need use as Button capacity (like Icon component).
 * This helps accessibility reader to tread as a interactive button to operation.
 */
import * as React from 'react';
import KeyCode from 'rc-util/lib/KeyCode';
const inlineStyle = {
  border: 0,
  background: 'transparent',
  padding: 0,
  lineHeight: 'inherit',
  display: 'inline-block',
};
class TransButton extends React.Component {
  onKeyDown = event => {
    const { keyCode } = event;
    if (keyCode === KeyCode.ENTER) {
      event.preventDefault();
    }
  };
  onKeyUp = event => {
    const { keyCode } = event;
    const { onClick } = this.props;
    if (keyCode === KeyCode.ENTER && onClick) {
      onClick();
    }
  };
  setRef = btn => {
    this.div = btn;
  };
  focus() {
    if (this.div) {
      this.div.focus();
    }
  }
  blur() {
    if (this.div) {
      this.div.blur();
    }
  }
  render() {
    const { style, noStyle, ...restProps } = this.props;
    return (
      <div
        role="button"
        tabIndex={0}
        ref={this.setRef}
        {...restProps}
        onKeyDown={this.onKeyDown}
        onKeyUp={this.onKeyUp}
        style={{
          ...(!noStyle ? inlineStyle : null),
          ...style,
        }}
      />
    );
  }
}
export default TransButton;
