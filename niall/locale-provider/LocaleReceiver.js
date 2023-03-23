import * as React from 'react';
import * as PropTypes from 'prop-types';
import defaultLocaleData from './default';
export default class LocaleReceiver extends React.Component {
  static defaultProps = {
    componentName: 'global',
  };
  static contextTypes = {
    antLocale: PropTypes.object,
  };
  getLocale() {
    const { componentName, defaultLocale } = this.props;
    const locale = defaultLocale || defaultLocaleData[componentName || 'global'];
    const { antLocale } = this.context;
    const localeFromContext = componentName && antLocale ? antLocale[componentName] : {};
    return {
      ...(typeof locale === 'function' ? locale() : locale),
      ...(localeFromContext || {}),
    };
  }
  getLocaleCode() {
    const { antLocale } = this.context;
    const localeCode = antLocale && antLocale.locale;
    // Had use LocaleProvide but didn't set locale
    if (antLocale && antLocale.exist && !localeCode) {
      return defaultLocaleData.locale;
    }
    return localeCode;
  }
  render() {
    return this.props.children(this.getLocale(), this.getLocaleCode(), this.context.antLocale);
  }
}
