// TODO: remove this lint
// SFC has specified a displayName, but not worked.
/* eslint-disable react/display-name */
import * as React from 'react';
import { RenderEmptyHandler } from './renderEmpty';
import LocaleProvider, { Locale, ANT_MARK } from '../locale-provider';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import { ConfigConsumer, ConfigContext, CSPConfig, ConfigConsumerProps } from './context';
export { RenderEmptyHandler, ConfigConsumer, CSPConfig, ConfigConsumerProps };
export const configConsumerProps = [
  'getPopupContainer',
  'rootPrefixCls',
  'getPrefixCls',
  'renderEmpty',
  'csp',
  'autoInsertSpaceInButton',
  'locale',
  'pageHeader',
];
class ConfigProvider extends React.Component {
  getPrefixCls = (suffixCls, customizePrefixCls) => {
    const { prefixCls = 'ant' } = this.props;
    if (customizePrefixCls) return customizePrefixCls;
    return suffixCls ? `${prefixCls}-${suffixCls}` : prefixCls;
  };
  renderProvider = (context, legacyLocale) => {
    const {
      children,
      getPopupContainer,
      renderEmpty,
      csp,
      autoInsertSpaceInButton,
      locale,
      pageHeader,
    } = this.props;
    const config = {
      ...context,
      getPrefixCls: this.getPrefixCls,
      csp,
      autoInsertSpaceInButton,
    };
    if (getPopupContainer) {
      config.getPopupContainer = getPopupContainer;
    }
    if (renderEmpty) {
      config.renderEmpty = renderEmpty;
    }
    if (pageHeader) {
      config.pageHeader = pageHeader;
    }
    return (
      <ConfigContext.Provider value={config}>
        <LocaleProvider locale={locale || legacyLocale} _ANT_MARK__={ANT_MARK}>
          {children}
        </LocaleProvider>
      </ConfigContext.Provider>
    );
  };
  render() {
    return (
      <LocaleReceiver>
        {(_, __, legacyLocale) => (
          <ConfigConsumer>{context => this.renderProvider(context, legacyLocale)}</ConfigConsumer>
        )}
      </LocaleReceiver>
    );
  }
}
export default ConfigProvider;
