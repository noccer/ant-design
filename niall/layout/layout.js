import * as React from 'react';
import classNames from 'classnames';
import createContext from '@ant-design/create-react-context';
import { SiderProps } from './Sider';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
export const LayoutContext = createContext({
  siderHook: {
    addSider: () => null,
    removeSider: () => null,
  },
});
function generator({ suffixCls, tagName, displayName }) {
  return BasicComponent => {
    return class Adapter extends React.Component {
      static displayName = displayName;
      renderComponent = ({ getPrefixCls }) => {
        const { prefixCls: customizePrefixCls } = this.props;
        const prefixCls = getPrefixCls(suffixCls, customizePrefixCls);
        return <BasicComponent prefixCls={prefixCls} tagName={tagName} {...this.props} />;
      };
      render() {
        return <ConfigConsumer>{this.renderComponent}</ConfigConsumer>;
      }
    };
  };
}
const Basic = props => {
  const { prefixCls, className, children, tagName, ...others } = props;
  const classString = classNames(className, prefixCls);
  return React.createElement(
    tagName,
    {
      className: classString,
      ...others,
    },
    children,
  );
};
class BasicLayout extends React.Component {
  state = {
    siders: [],
  };
  getSiderHook() {
    return {
      addSider: id => {
        this.setState(state => ({
          siders: [...state.siders, id],
        }));
      },
      removeSider: id => {
        this.setState(state => ({
          siders: state.siders.filter(currentId => currentId !== id),
        }));
      },
    };
  }
  render() {
    const { prefixCls, className, children, hasSider, tagName: Tag, ...others } = this.props;
    const classString = classNames(className, prefixCls, {
      [`${prefixCls}-has-sider`]:
        typeof hasSider === 'boolean' ? hasSider : this.state.siders.length > 0,
    });
    return (
      <LayoutContext.Provider
        value={{
          siderHook: this.getSiderHook(),
        }}
      >
        <Tag className={classString} {...others}>
          {children}
        </Tag>
      </LayoutContext.Provider>
    );
  }
}
const Layout = generator({
  suffixCls: 'layout',
  tagName: 'section',
  displayName: 'Layout',
})(BasicLayout);
const Header = generator({
  suffixCls: 'layout-header',
  tagName: 'header',
  displayName: 'Header',
})(Basic);
const Footer = generator({
  suffixCls: 'layout-footer',
  tagName: 'footer',
  displayName: 'Footer',
})(Basic);
const Content = generator({
  suffixCls: 'layout-content',
  tagName: 'main',
  displayName: 'Content',
})(Basic);
Layout.Header = Header;
Layout.Footer = Footer;
Layout.Content = Content;
export default Layout;
