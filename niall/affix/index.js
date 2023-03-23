import * as React from 'react';
import { polyfill } from 'react-lifecycles-compat';
import classNames from 'classnames';
import omit from 'omit.js';
import ResizeObserver from 'rc-resize-observer';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import { throttleByAnimationFrameDecorator } from '../_util/throttleByAnimationFrame';
import warning from '../_util/warning';
import {
  addObserveTarget,
  removeObserveTarget,
  getTargetRect,
  getFixedTop,
  getFixedBottom,
} from './utils';
function getDefaultTarget() {
  return typeof window !== 'undefined' ? window : null;
}

// Affix
var AffixStatus = /*#__PURE__*/ (function(AffixStatus) {
  AffixStatus[(AffixStatus['None'] = 0)] = 'None';
  AffixStatus[(AffixStatus['Prepare'] = 1)] = 'Prepare';
  return AffixStatus;
})(AffixStatus || {});
class Affix extends React.Component {
  static defaultProps = {
    target: getDefaultTarget,
  };
  state = {
    status: AffixStatus.None,
    lastAffix: false,
    prevTarget: null,
  };
  // Event handler
  componentDidMount() {
    const { target } = this.props;
    if (target) {
      // [Legacy] Wait for parent component ref has its value.
      // We should use target as directly element instead of function which makes element check hard.
      this.timeout = setTimeout(() => {
        addObserveTarget(target(), this);
        // Mock Event object.
        this.updatePosition();
      });
    }
  }
  componentDidUpdate(prevProps) {
    const { prevTarget } = this.state;
    const { target } = this.props;
    let newTarget = null;
    if (target) {
      newTarget = target() || null;
    }
    if (prevTarget !== newTarget) {
      removeObserveTarget(this);
      if (newTarget) {
        addObserveTarget(newTarget, this);
        // Mock Event object.
        this.updatePosition();
      }
      this.setState({
        prevTarget: newTarget,
      });
    }
    if (
      prevProps.offsetTop !== this.props.offsetTop ||
      prevProps.offsetBottom !== this.props.offsetBottom
    ) {
      this.updatePosition();
    }
    this.measure();
  }
  componentWillUnmount() {
    clearTimeout(this.timeout);
    removeObserveTarget(this);
    this.updatePosition.cancel();
    // https://github.com/ant-design/ant-design/issues/22683
    this.lazyUpdatePosition.cancel();
  }
  getOffsetTop = () => {
    const { offset, offsetBottom } = this.props;
    let { offsetTop } = this.props;
    if (typeof offsetTop === 'undefined') {
      offsetTop = offset;
      warning(
        typeof offset === 'undefined',
        'Affix',
        '`offset` is deprecated. Please use `offsetTop` instead.',
      );
    }
    if (offsetBottom === undefined && offsetTop === undefined) {
      offsetTop = 0;
    }
    return offsetTop;
  };
  getOffsetBottom = () => {
    return this.props.offsetBottom;
  };
  savePlaceholderNode = node => {
    this.placeholderNode = node;
  };
  saveFixedNode = node => {
    this.fixedNode = node;
  };

  // =================== Measure ===================
  measure = () => {
    const { status, lastAffix } = this.state;
    const { target, onChange } = this.props;
    if (status !== AffixStatus.Prepare || !this.fixedNode || !this.placeholderNode || !target) {
      return;
    }
    const offsetTop = this.getOffsetTop();
    const offsetBottom = this.getOffsetBottom();
    const targetNode = target();
    if (!targetNode) {
      return;
    }
    const newState = {
      status: AffixStatus.None,
    };
    const targetRect = getTargetRect(targetNode);
    const placeholderReact = getTargetRect(this.placeholderNode);
    const fixedTop = getFixedTop(placeholderReact, targetRect, offsetTop);
    const fixedBottom = getFixedBottom(placeholderReact, targetRect, offsetBottom);
    if (fixedTop !== undefined) {
      newState.affixStyle = {
        position: 'fixed',
        top: fixedTop,
        width: placeholderReact.width,
        height: placeholderReact.height,
      };
      newState.placeholderStyle = {
        width: placeholderReact.width,
        height: placeholderReact.height,
      };
    } else if (fixedBottom !== undefined) {
      newState.affixStyle = {
        position: 'fixed',
        bottom: fixedBottom,
        width: placeholderReact.width,
        height: placeholderReact.height,
      };
      newState.placeholderStyle = {
        width: placeholderReact.width,
        height: placeholderReact.height,
      };
    }
    newState.lastAffix = !!newState.affixStyle;
    if (onChange && lastAffix !== newState.lastAffix) {
      onChange(newState.lastAffix);
    }
    this.setState(newState);
  };

  // @ts-ignore TS6133
  prepareMeasure = () => {
    // event param is used before. Keep compatible ts define here.
    this.setState({
      status: AffixStatus.Prepare,
      affixStyle: undefined,
      placeholderStyle: undefined,
    });

    // Test if `updatePosition` called
    if (process.env.NODE_ENV === 'test') {
      const { onTestUpdatePosition } = this.props;
      if (onTestUpdatePosition) {
        onTestUpdatePosition();
      }
    }
  };

  // Handle realign logic
  @throttleByAnimationFrameDecorator()
  updatePosition() {
    this.prepareMeasure();
  }
  @throttleByAnimationFrameDecorator()
  lazyUpdatePosition() {
    const { target } = this.props;
    const { affixStyle } = this.state;

    // Check position change before measure to make Safari smooth
    if (target && affixStyle) {
      const offsetTop = this.getOffsetTop();
      const offsetBottom = this.getOffsetBottom();
      const targetNode = target();
      if (targetNode && this.placeholderNode) {
        const targetRect = getTargetRect(targetNode);
        const placeholderReact = getTargetRect(this.placeholderNode);
        const fixedTop = getFixedTop(placeholderReact, targetRect, offsetTop);
        const fixedBottom = getFixedBottom(placeholderReact, targetRect, offsetBottom);
        if (
          (fixedTop !== undefined && affixStyle.top === fixedTop) ||
          (fixedBottom !== undefined && affixStyle.bottom === fixedBottom)
        ) {
          return;
        }
      }
    }

    // Directly call prepare measure since it's already throttled.
    this.prepareMeasure();
  }

  // =================== Render ===================
  renderAffix = ({ getPrefixCls }) => {
    const { affixStyle, placeholderStyle } = this.state;
    const { prefixCls, children } = this.props;
    const className = classNames({
      [getPrefixCls('affix', prefixCls)]: affixStyle,
    });
    let props = omit(this.props, ['prefixCls', 'offsetTop', 'offsetBottom', 'target', 'onChange']);
    // Omit this since `onTestUpdatePosition` only works on test.
    if (process.env.NODE_ENV === 'test') {
      props = omit(props, ['onTestUpdatePosition']);
    }
    return (
      <ResizeObserver
        onResize={() => {
          this.updatePosition();
        }}
      >
        <div {...props} ref={this.savePlaceholderNode}>
          {affixStyle && <div style={placeholderStyle} aria-hidden="true" />}
          <div className={className} ref={this.saveFixedNode} style={affixStyle}>
            <ResizeObserver
              onResize={() => {
                this.updatePosition();
              }}
            >
              {children}
            </ResizeObserver>
          </div>
        </div>
      </ResizeObserver>
    );
  };
  render() {
    return <ConfigConsumer>{this.renderAffix}</ConfigConsumer>;
  }
}
polyfill(Affix);
export default Affix;
