import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as moment from 'moment';
import FullCalendar from 'rc-calendar/lib/FullCalendar';
import { polyfill } from 'react-lifecycles-compat';
import Header, { HeaderRender } from './Header';
import enUS from './locale/en_US';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import interopDefault from '../_util/interopDefault';
export { HeaderProps } from './Header';
function noop() {
  return null;
}
function zerofixed(v) {
  if (v < 10) {
    return `0${v}`;
  }
  return `${v}`;
}
class Calendar extends React.Component {
  static defaultProps = {
    locale: {},
    fullscreen: true,
    onSelect: noop,
    onPanelChange: noop,
    onChange: noop,
  };
  static propTypes = {
    monthCellRender: PropTypes.func,
    dateCellRender: PropTypes.func,
    monthFullCellRender: PropTypes.func,
    dateFullCellRender: PropTypes.func,
    fullscreen: PropTypes.bool,
    locale: PropTypes.object,
    prefixCls: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    onPanelChange: PropTypes.func,
    value: PropTypes.object,
    onSelect: PropTypes.func,
    onChange: PropTypes.func,
    headerRender: PropTypes.func,
  };
  static getDerivedStateFromProps(nextProps) {
    const newState = {};
    if ('value' in nextProps) {
      newState.value = nextProps.value;
    }
    if ('mode' in nextProps) {
      newState.mode = nextProps.mode;
    }
    return Object.keys(newState).length > 0 ? newState : null;
  }
  constructor(props) {
    super(props);
    const value = props.value || props.defaultValue || interopDefault(moment)();
    if (!interopDefault(moment).isMoment(value)) {
      throw new Error(
        'The value/defaultValue of Calendar must be a moment object after `antd@2.0`, ' +
          'see: https://u.ant.design/calendar-value',
      );
    }
    this.state = {
      value,
      mode: props.mode || 'month',
    };
  }
  onHeaderValueChange = value => {
    this.setValue(value, 'changePanel');
  };
  onHeaderTypeChange = mode => {
    this.setState({
      mode,
    });
    this.onPanelChange(this.state.value, mode);
  };
  onPanelChange(value, mode) {
    const { onPanelChange, onChange } = this.props;
    if (onPanelChange) {
      onPanelChange(value, mode);
    }
    if (onChange && value !== this.state.value) {
      onChange(value);
    }
  }
  onSelect = value => {
    this.setValue(value, 'select');
  };
  setValue = (value, way) => {
    const prevValue = this.props.value || this.state.value;
    const { mode } = this.state;
    if (!('value' in this.props)) {
      this.setState({
        value,
      });
    }
    if (way === 'select') {
      if (prevValue && prevValue.month() !== value.month()) {
        this.onPanelChange(value, mode);
      }
      if (this.props.onSelect) {
        this.props.onSelect(value);
      }
    } else if (way === 'changePanel') {
      this.onPanelChange(value, mode);
    }
  };
  getDateRange = (validRange, disabledDate) => current => {
    if (!current) {
      return false;
    }
    const [startDate, endDate] = validRange;
    const inRange = !current.isBetween(startDate, endDate, 'days', '[]');
    if (disabledDate) {
      return disabledDate(current) || inRange;
    }
    return inRange;
  };
  getDefaultLocale = () => {
    const result = {
      ...enUS,
      ...this.props.locale,
    };
    result.lang = {
      ...result.lang,
      ...(this.props.locale || {}).lang,
    };
    return result;
  };
  monthCellRender = value => {
    const { monthCellRender = noop } = this.props;
    const { prefixCls } = this;
    return (
      <div className={`${prefixCls}-month`}>
        <div className={`${prefixCls}-value`}>{value.localeData().monthsShort(value)}</div>
        <div className={`${prefixCls}-content`}>{monthCellRender(value)}</div>
      </div>
    );
  };
  dateCellRender = value => {
    const { dateCellRender = noop } = this.props;
    const { prefixCls } = this;
    return (
      <div className={`${prefixCls}-date`}>
        <div className={`${prefixCls}-value`}>{zerofixed(value.date())}</div>
        <div className={`${prefixCls}-content`}>{dateCellRender(value)}</div>
      </div>
    );
  };
  renderCalendar = (locale, localeCode) => {
    const { state, props } = this;
    const { value, mode } = state;
    if (value && localeCode) {
      value.locale(localeCode);
    }
    const {
      prefixCls: customizePrefixCls,
      style,
      className,
      fullscreen,
      headerRender,
      dateFullCellRender,
      monthFullCellRender,
    } = props;
    const monthCellRender = monthFullCellRender || this.monthCellRender;
    const dateCellRender = dateFullCellRender || this.dateCellRender;
    let { disabledDate } = props;
    if (props.validRange) {
      disabledDate = this.getDateRange(props.validRange, disabledDate);
    }
    return (
      <ConfigConsumer>
        {({ getPrefixCls }) => {
          const prefixCls = getPrefixCls('fullcalendar', customizePrefixCls);

          // To support old version react.
          // Have to add prefixCls on the instance.
          // https://github.com/facebook/react/issues/12397
          this.prefixCls = prefixCls;
          let cls = className || '';
          if (fullscreen) {
            cls += ` ${prefixCls}-fullscreen`;
          }
          return (
            <div className={cls} style={style}>
              <Header
                fullscreen={fullscreen}
                type={mode}
                headerRender={headerRender}
                value={value}
                locale={locale.lang}
                prefixCls={prefixCls}
                onTypeChange={this.onHeaderTypeChange}
                onValueChange={this.onHeaderValueChange}
                validRange={props.validRange}
              />
              <FullCalendar
                {...props}
                disabledDate={disabledDate}
                Select={noop}
                locale={locale.lang}
                type={mode === 'year' ? 'month' : 'date'}
                prefixCls={prefixCls}
                showHeader={false}
                value={value}
                monthCellRender={monthCellRender}
                dateCellRender={dateCellRender}
                onSelect={this.onSelect}
              />
            </div>
          );
        }}
      </ConfigConsumer>
    );
  };
  render() {
    return (
      <LocaleReceiver componentName="Calendar" defaultLocale={this.getDefaultLocale}>
        {this.renderCalendar}
      </LocaleReceiver>
    );
  }
}
polyfill(Calendar);
export default Calendar;
