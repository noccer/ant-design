import * as React from 'react';
import { polyfill } from 'react-lifecycles-compat';
import ResizeObserver from 'rc-resize-observer';
import omit from 'omit.js';
import classNames from 'classnames';
import calculateNodeHeight from './calculateNodeHeight';
import raf from '../_util/raf';
import warning from '../_util/warning';
import { TextAreaProps } from './TextArea';
class ResizableTextArea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      textareaStyles: {},
      resizing: false,
    };
  }
  saveTextArea = textArea => {
    this.textArea = textArea;
  };
  componentDidMount() {
    this.resizeTextarea();
  }
  componentDidUpdate(prevProps) {
    // Re-render with the new content then recalculate the height as required.
    if (prevProps.value !== this.props.value) {
      this.resizeTextarea();
    }
  }
  resizeOnNextFrame = () => {
    raf.cancel(this.nextFrameActionId);
    this.nextFrameActionId = raf(this.resizeTextarea);
  };
  resizeTextarea = () => {
    const autoSize = this.props.autoSize || this.props.autosize;
    if (!autoSize || !this.textArea) {
      return;
    }
    const { minRows, maxRows } = autoSize;
    const textareaStyles = calculateNodeHeight(this.textArea, false, minRows, maxRows);
    this.setState(
      {
        textareaStyles,
        resizing: true,
      },
      () => {
        raf.cancel(this.resizeFrameId);
        this.resizeFrameId = raf(() => {
          this.setState({
            resizing: false,
          });
          this.fixFirefoxAutoScroll();
        });
      },
    );
  };
  componentWillUnmount() {
    raf.cancel(this.nextFrameActionId);
    raf.cancel(this.resizeFrameId);
  }

  // https://github.com/ant-design/ant-design/issues/21870
  fixFirefoxAutoScroll() {
    try {
      if (document.activeElement === this.textArea) {
        const currentStart = this.textArea.selectionStart;
        const currentEnd = this.textArea.selectionEnd;
        this.textArea.setSelectionRange(currentStart, currentEnd);
      }
    } catch (e) {
      // Fix error in Chrome:
      // Failed to read the 'selectionStart' property from 'HTMLInputElement'
      // http://stackoverflow.com/q/21177489/3040605
    }
  }
  renderTextArea = () => {
    const { prefixCls, autoSize, autosize, className, disabled } = this.props;
    const { textareaStyles, resizing } = this.state;
    warning(
      autosize === undefined,
      'Input.TextArea',
      'autosize is deprecated, please use autoSize instead.',
    );
    const otherProps = omit(this.props, [
      'prefixCls',
      'onPressEnter',
      'autoSize',
      'autosize',
      'defaultValue',
      'allowClear',
    ]);
    const cls = classNames(prefixCls, className, {
      [`${prefixCls}-disabled`]: disabled,
    });
    // Fix https://github.com/ant-design/ant-design/issues/6776
    // Make sure it could be reset when using form.getFieldDecorator
    if ('value' in otherProps) {
      otherProps.value = otherProps.value || '';
    }
    const style = {
      ...this.props.style,
      ...textareaStyles,
      ...(resizing
        ? {
            overflowX: 'hidden',
            overflowY: 'hidden',
          }
        : null),
    };
    return (
      <ResizeObserver onResize={this.resizeOnNextFrame} disabled={!(autoSize || autosize)}>
        <textarea {...otherProps} className={cls} style={style} ref={this.saveTextArea} />
      </ResizeObserver>
    );
  };
  render() {
    return this.renderTextArea();
  }
}
polyfill(ResizableTextArea);
export default ResizableTextArea;
