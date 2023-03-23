import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as moment from 'moment';
import interopDefault from '../_util/interopDefault';
import { ModalLocale, changeConfirmLocale } from '../modal/locale';
import warning from '../_util/warning';
export const ANT_MARK = 'internalMark';
function setMomentLocale(locale) {
  if (locale && locale.locale) {
    interopDefault(moment).locale(locale.locale);
  } else {
    interopDefault(moment).locale('en');
  }
}
export default class LocaleProvider extends React.Component {
  static propTypes = {
    locale: PropTypes.object,
  };
  static defaultProps = {
    locale: {},
  };
  static childContextTypes = {
    antLocale: PropTypes.object,
  };
  constructor(props) {
    super(props);
    setMomentLocale(props.locale);
    changeConfirmLocale(props.locale && props.locale.Modal);
    warning(
      props._ANT_MARK__ === ANT_MARK,
      'LocaleProvider',
      '`LocaleProvider` is deprecated. Please use `locale` with `ConfigProvider` instead: http://u.ant.design/locale',
    );
  }
  getChildContext() {
    return {
      antLocale: {
        ...this.props.locale,
        exist: true,
      },
    };
  }
  componentDidUpdate(prevProps) {
    const { locale } = this.props;
    if (prevProps.locale !== locale) {
      setMomentLocale(locale);
      changeConfirmLocale(locale && locale.Modal);
    }
  }
  componentWillUnmount() {
    changeConfirmLocale();
  }
  render() {
    return this.props.children;
  }
}
