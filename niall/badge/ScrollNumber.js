import * as React from 'react';
import omit from 'omit.js';
import classNames from 'classnames';
import { polyfill } from 'react-lifecycles-compat';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
function getNumberArray(num) {
  return num
    ? num
        .toString()
        .split('')
        .reverse()
        .map(i => {
          const current = Number(i);
          return isNaN(current) ? i : current;
        })
    : [];
}
function renderNumberList(position, className) {
  const childrenToReturn = [];
  for (let i = 0; i < 30; i++) {
    childrenToReturn.push(
      <p
        key={i.toString()}
        className={classNames(className, {
          current: position === i,
        })}
      >
        {i % 10}
      </p>,
    );
  }
  return childrenToReturn;
}
class ScrollNumber extends React.Component {
  static defaultProps = {
    count: null,
    onAnimated() {},
  };
  static getDerivedStateFromProps(nextProps, nextState) {
    if ('count' in nextProps) {
      if (nextState.count === nextProps.count) {
        return null;
      }
      return {
        animateStarted: true,
      };
    }
    return null;
  }
  constructor(props) {
    super(props);
    this.state = {
      animateStarted: true,
      count: props.count,
    };
  }
  componentDidUpdate(_, prevState) {
    this.lastCount = prevState.count;
    const { animateStarted } = this.state;
    if (animateStarted) {
      this.clearTimeout();
      // Let browser has time to reset the scroller before actually
      // performing the transition.
      this.timeout = setTimeout(() => {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState(
          (__, props) => ({
            animateStarted: false,
            count: props.count,
          }),
          this.onAnimated,
        );
      });
    }
  }
  componentWillUnmount() {
    this.clearTimeout();
  }
  getPositionByNum(num, i) {
    const { count } = this.state;
    const currentCount = Math.abs(Number(count));
    const lastCount = Math.abs(Number(this.lastCount));
    const currentDigit = Math.abs(getNumberArray(this.state.count)[i]);
    const lastDigit = Math.abs(getNumberArray(this.lastCount)[i]);
    if (this.state.animateStarted) {
      return 10 + num;
    }

    // 同方向则在同一侧切换数字
    if (currentCount > lastCount) {
      if (currentDigit >= lastDigit) {
        return 10 + num;
      }
      return 20 + num;
    }
    if (currentDigit <= lastDigit) {
      return 10 + num;
    }
    return num;
  }
  onAnimated = () => {
    const { onAnimated } = this.props;
    if (onAnimated) {
      onAnimated();
    }
  };
  renderCurrentNumber(prefixCls, num, i) {
    if (typeof num === 'number') {
      const position = this.getPositionByNum(num, i);
      const removeTransition =
        this.state.animateStarted || getNumberArray(this.lastCount)[i] === undefined;
      return React.createElement(
        'span',
        {
          className: `${prefixCls}-only`,
          style: {
            transition: removeTransition ? 'none' : undefined,
            msTransform: `translateY(${-position * 100}%)`,
            WebkitTransform: `translateY(${-position * 100}%)`,
            transform: `translateY(${-position * 100}%)`,
          },
          key: i,
        },
        renderNumberList(position, `${prefixCls}-only-unit`),
      );
    }
    return (
      <span key="symbol" className={`${prefixCls}-symbol`}>
        {num}
      </span>
    );
  }
  renderNumberElement(prefixCls) {
    const { count } = this.state;
    if (count && Number(count) % 1 === 0) {
      return getNumberArray(count)
        .map((num, i) => this.renderCurrentNumber(prefixCls, num, i))
        .reverse();
    }
    return count;
  }
  renderScrollNumber = ({ getPrefixCls }) => {
    const {
      prefixCls: customizePrefixCls,
      className,
      style,
      title,
      component = 'sup',
      displayComponent,
    } = this.props;
    // fix https://fb.me/react-unknown-prop
    const restProps = omit(this.props, [
      'count',
      'onAnimated',
      'component',
      'prefixCls',
      'displayComponent',
    ]);
    const prefixCls = getPrefixCls('scroll-number', customizePrefixCls);
    const newProps = {
      ...restProps,
      className: classNames(prefixCls, className),
      title: title,
    };

    // allow specify the border
    // mock border-color by box-shadow for compatible with old usage:
    // <Badge count={4} style={{ backgroundColor: '#fff', color: '#999', borderColor: '#d9d9d9' }} />
    if (style && style.borderColor) {
      newProps.style = {
        ...style,
        boxShadow: `0 0 0 1px ${style.borderColor} inset`,
      };
    }
    if (displayComponent) {
      return React.cloneElement(displayComponent, {
        className: classNames(
          `${prefixCls}-custom-component`,
          displayComponent.props && displayComponent.props.className,
        ),
      });
    }
    return React.createElement(component, newProps, this.renderNumberElement(prefixCls));
  };
  render() {
    return <ConfigConsumer>{this.renderScrollNumber}</ConfigConsumer>;
  }
  clearTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
  }
}
polyfill(ScrollNumber);
export default ScrollNumber;
