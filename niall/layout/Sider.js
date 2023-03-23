import createContext, { Context } from '@ant-design/create-react-context';
import * as React from 'react';
import { polyfill } from 'react-lifecycles-compat';
import classNames from 'classnames';
import omit from 'omit.js';
import { LayoutContext, LayoutContextProps } from './layout';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import Icon from '../icon';
import isNumeric from '../_util/isNumeric';

// matchMedia polyfill for
// https://github.com/WickyNilliams/enquire.js/issues/82
// TODO: Will be removed in antd 4.0 because we will no longer support ie9
if (typeof window !== 'undefined') {
  const matchMediaPolyfill = mediaQuery => {
    return {
      media: mediaQuery,
      matches: false,
      addListener() {},
      removeListener() {},
    };
  };
  // ref: https://github.com/ant-design/ant-design/issues/18774
  if (!window.matchMedia) window.matchMedia = matchMediaPolyfill;
}
const dimensionMaxMap = {
  xs: '479.98px',
  sm: '575.98px',
  md: '767.98px',
  lg: '991.98px',
  xl: '1199.98px',
  xxl: '1599.98px',
};
export const SiderContext = createContext({});
const generateId = (() => {
  let i = 0;
  return (prefix = '') => {
    i += 1;
    return `${prefix}${i}`;
  };
})();
class InternalSider extends React.Component {
  static defaultProps = {
    collapsible: false,
    defaultCollapsed: false,
    reverseArrow: false,
    width: 200,
    collapsedWidth: 80,
    style: {},
    theme: 'dark',
  };
  static getDerivedStateFromProps(nextProps) {
    if ('collapsed' in nextProps) {
      return {
        collapsed: nextProps.collapsed,
      };
    }
    return null;
  }
  constructor(props) {
    super(props);
    this.uniqueId = generateId('ant-sider-');
    let matchMedia;
    if (typeof window !== 'undefined') {
      matchMedia = window.matchMedia;
    }
    if (matchMedia && props.breakpoint && props.breakpoint in dimensionMaxMap) {
      this.mql = matchMedia(`(max-width: ${dimensionMaxMap[props.breakpoint]})`);
    }
    let collapsed;
    if ('collapsed' in props) {
      collapsed = props.collapsed;
    } else {
      collapsed = props.defaultCollapsed;
    }
    this.state = {
      collapsed,
      below: false,
    };
  }
  componentDidMount() {
    if (this.mql) {
      this.mql.addListener(this.responsiveHandler);
      this.responsiveHandler(this.mql);
    }
    if (this.props.siderHook) {
      this.props.siderHook.addSider(this.uniqueId);
    }
  }
  componentWillUnmount() {
    if (this.mql) {
      this.mql.removeListener(this.responsiveHandler);
    }
    if (this.props.siderHook) {
      this.props.siderHook.removeSider(this.uniqueId);
    }
  }
  responsiveHandler = mql => {
    this.setState({
      below: mql.matches,
    });
    const { onBreakpoint } = this.props;
    if (onBreakpoint) {
      onBreakpoint(mql.matches);
    }
    if (this.state.collapsed !== mql.matches) {
      this.setCollapsed(mql.matches, 'responsive');
    }
  };
  setCollapsed = (collapsed, type) => {
    if (!('collapsed' in this.props)) {
      this.setState({
        collapsed,
      });
    }
    const { onCollapse } = this.props;
    if (onCollapse) {
      onCollapse(collapsed, type);
    }
  };
  toggle = () => {
    const collapsed = !this.state.collapsed;
    this.setCollapsed(collapsed, 'clickTrigger');
  };
  belowShowChange = () => {
    this.setState(({ belowShow }) => ({
      belowShow: !belowShow,
    }));
  };
  renderSider = ({ getPrefixCls }) => {
    const {
      prefixCls: customizePrefixCls,
      className,
      theme,
      collapsible,
      reverseArrow,
      trigger,
      style,
      width,
      collapsedWidth,
      zeroWidthTriggerStyle,
      ...others
    } = this.props;
    const prefixCls = getPrefixCls('layout-sider', customizePrefixCls);
    const divProps = omit(others, [
      'collapsed',
      'defaultCollapsed',
      'onCollapse',
      'breakpoint',
      'onBreakpoint',
      'siderHook',
      'zeroWidthTriggerStyle',
    ]);
    const rawWidth = this.state.collapsed ? collapsedWidth : width;
    // use "px" as fallback unit for width
    const siderWidth = isNumeric(rawWidth) ? `${rawWidth}px` : String(rawWidth);
    // special trigger when collapsedWidth == 0
    const zeroWidthTrigger =
      parseFloat(String(collapsedWidth || 0)) === 0 ? (
        <span
          onClick={this.toggle}
          className={`${prefixCls}-zero-width-trigger ${prefixCls}-zero-width-trigger-${
            reverseArrow ? 'right' : 'left'
          }`}
          style={zeroWidthTriggerStyle}
        >
          <Icon type="bars" />
        </span>
      ) : null;
    const iconObj = {
      expanded: reverseArrow ? <Icon type="right" /> : <Icon type="left" />,
      collapsed: reverseArrow ? <Icon type="left" /> : <Icon type="right" />,
    };
    const status = this.state.collapsed ? 'collapsed' : 'expanded';
    const defaultTrigger = iconObj[status];
    const triggerDom =
      trigger !== null
        ? zeroWidthTrigger || (
            <div
              className={`${prefixCls}-trigger`}
              onClick={this.toggle}
              style={{
                width: siderWidth,
              }}
            >
              {trigger || defaultTrigger}
            </div>
          )
        : null;
    const divStyle = {
      ...style,
      flex: `0 0 ${siderWidth}`,
      maxWidth: siderWidth,
      // Fix width transition bug in IE11
      minWidth: siderWidth,
      // https://github.com/ant-design/ant-design/issues/6349
      width: siderWidth,
    };
    const siderCls = classNames(className, prefixCls, `${prefixCls}-${theme}`, {
      [`${prefixCls}-collapsed`]: !!this.state.collapsed,
      [`${prefixCls}-has-trigger`]: collapsible && trigger !== null && !zeroWidthTrigger,
      [`${prefixCls}-below`]: !!this.state.below,
      [`${prefixCls}-zero-width`]: parseFloat(siderWidth) === 0,
    });
    return (
      <aside className={siderCls} {...divProps} style={divStyle}>
        <div className={`${prefixCls}-children`}>{this.props.children}</div>
        {collapsible || (this.state.below && zeroWidthTrigger) ? triggerDom : null}
      </aside>
    );
  };
  render() {
    const { collapsed } = this.state;
    const { collapsedWidth } = this.props;
    return (
      <SiderContext.Provider
        value={{
          siderCollapsed: collapsed,
          collapsedWidth,
        }}
      >
        <ConfigConsumer>{this.renderSider}</ConfigConsumer>
      </SiderContext.Provider>
    );
  }
}
polyfill(InternalSider);

// eslint-disable-next-line react/prefer-stateless-function
export default class Sider extends React.Component {
  render() {
    return (
      <LayoutContext.Consumer>
        {context => <InternalSider {...context} {...this.props} />}
      </LayoutContext.Consumer>
    );
  }
}