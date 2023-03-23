import * as React from 'react';
import classNames from 'classnames';
import * as PropTypes from 'prop-types';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import RowContext from './RowContext';
import { tuple } from '../_util/type';
import ResponsiveObserve, {
  Breakpoint,
  BreakpointMap,
  responsiveArray,
} from '../_util/responsiveObserve';
const RowAligns = tuple('top', 'middle', 'bottom', 'stretch');
const RowJustify = tuple('start', 'end', 'center', 'space-around', 'space-between');
export default class Row extends React.Component {
  static defaultProps = {
    gutter: 0,
  };
  static propTypes = {
    type: PropTypes.oneOf(['flex']),
    align: PropTypes.oneOf(RowAligns),
    justify: PropTypes.oneOf(RowJustify),
    className: PropTypes.string,
    children: PropTypes.node,
    gutter: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
    prefixCls: PropTypes.string,
  };
  state = {
    screens: {},
  };
  componentDidMount() {
    this.token = ResponsiveObserve.subscribe(screens => {
      const { gutter } = this.props;
      if (
        typeof gutter === 'object' ||
        (Array.isArray(gutter) && (typeof gutter[0] === 'object' || typeof gutter[1] === 'object'))
      ) {
        this.setState({
          screens,
        });
      }
    });
  }
  componentWillUnmount() {
    ResponsiveObserve.unsubscribe(this.token);
  }
  getGutter() {
    const results = [0, 0];
    const { gutter } = this.props;
    const { screens } = this.state;
    const normalizedGutter = Array.isArray(gutter) ? gutter : [gutter, 0];
    normalizedGutter.forEach((g, index) => {
      if (typeof g === 'object') {
        for (let i = 0; i < responsiveArray.length; i++) {
          const breakpoint = responsiveArray[i];
          if (screens[breakpoint] && g[breakpoint] !== undefined) {
            results[index] = g[breakpoint];
            break;
          }
        }
      } else {
        results[index] = g || 0;
      }
    });
    return results;
  }
  renderRow = ({ getPrefixCls }) => {
    const {
      prefixCls: customizePrefixCls,
      type,
      justify,
      align,
      className,
      style,
      children,
      ...others
    } = this.props;
    const prefixCls = getPrefixCls('row', customizePrefixCls);
    const gutter = this.getGutter();
    const classes = classNames(
      {
        [prefixCls]: !type,
        [`${prefixCls}-${type}`]: type,
        [`${prefixCls}-${type}-${justify}`]: type && justify,
        [`${prefixCls}-${type}-${align}`]: type && align,
      },
      className,
    );
    const rowStyle = {
      ...(gutter[0] > 0
        ? {
            marginLeft: gutter[0] / -2,
            marginRight: gutter[0] / -2,
          }
        : {}),
      ...(gutter[1] > 0
        ? {
            marginTop: gutter[1] / -2,
            marginBottom: gutter[1] / -2,
          }
        : {}),
      ...style,
    };
    const otherProps = {
      ...others,
    };
    delete otherProps.gutter;
    return (
      <RowContext.Provider
        value={{
          gutter,
        }}
      >
        <div {...otherProps} className={classes} style={rowStyle}>
          {children}
        </div>
      </RowContext.Provider>
    );
  };
  render() {
    return <ConfigConsumer>{this.renderRow}</ConfigConsumer>;
  }
}
