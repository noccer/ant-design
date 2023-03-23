import * as React from 'react';
import * as moment from 'moment';
import omit from 'omit.js';
import { polyfill } from 'react-lifecycles-compat';
import RcTimePicker from 'rc-time-picker/lib/TimePicker';
import classNames from 'classnames';
import warning from '../_util/warning';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import enUS from './locale/en_US';
import interopDefault from '../_util/interopDefault';
import Icon from '../icon';
export function generateShowHourMinuteSecond(format) {
  // Ref: http://momentjs.com/docs/#/parsing/string-format/
  return {
    showHour: format.indexOf('H') > -1 || format.indexOf('h') > -1 || format.indexOf('k') > -1,
    showMinute: format.indexOf('m') > -1,
    showSecond: format.indexOf('s') > -1,
  };
}
class TimePicker extends React.Component {
  static defaultProps = {
    align: {
      offset: [0, -2],
    },
    disabledHours: undefined,
    disabledMinutes: undefined,
    disabledSeconds: undefined,
    hideDisabledOptions: false,
    placement: 'bottomLeft',
    transitionName: 'slide-up',
    focusOnOpen: true,
  };
  static getDerivedStateFromProps(nextProps) {
    if ('value' in nextProps) {
      return {
        value: nextProps.value,
      };
    }
    return null;
  }
  constructor(props) {
    super(props);
    const value = props.value || props.defaultValue;
    if (value && !interopDefault(moment).isMoment(value)) {
      throw new Error(
        'The value/defaultValue of TimePicker must be a moment object after `antd@2.0`, ' +
          'see: https://u.ant.design/time-picker-value',
      );
    }
    this.state = {
      value,
    };
    warning(
      !('allowEmpty' in props),
      'TimePicker',
      '`allowEmpty` is deprecated. Please use `allowClear` instead.',
    );
  }
  getDefaultFormat() {
    const { format, use12Hours } = this.props;
    if (format) {
      return format;
    }
    if (use12Hours) {
      return 'h:mm:ss a';
    }
    return 'HH:mm:ss';
  }
  getAllowClear() {
    const { allowClear, allowEmpty } = this.props;
    if ('allowClear' in this.props) {
      return allowClear;
    }
    return allowEmpty;
  }
  getDefaultLocale = () => {
    const defaultLocale = {
      ...enUS,
      ...this.props.locale,
    };
    return defaultLocale;
  };
  handleOpenClose = ({ open }) => {
    const { onOpenChange } = this.props;
    if (onOpenChange) {
      onOpenChange(open);
    }
  };
  saveTimePicker = timePickerRef => {
    this.timePickerRef = timePickerRef;
  };
  handleChange = value => {
    if (!('value' in this.props)) {
      this.setState({
        value,
      });
    }
    const { onChange, format = 'HH:mm:ss' } = this.props;
    if (onChange) {
      onChange(value, (value && value.format(format)) || '');
    }
  };
  focus() {
    this.timePickerRef.focus();
  }
  blur() {
    this.timePickerRef.blur();
  }
  renderInputIcon(prefixCls) {
    const { suffixIcon } = this.props;
    const clockIcon = (suffixIcon &&
      React.isValidElement(suffixIcon) &&
      React.cloneElement(suffixIcon, {
        className: classNames(suffixIcon.props.className, `${prefixCls}-clock-icon`),
      })) || <Icon type="clock-circle" className={`${prefixCls}-clock-icon`} />;
    return <span className={`${prefixCls}-icon`}>{clockIcon}</span>;
  }
  renderClearIcon(prefixCls) {
    const { clearIcon } = this.props;
    const clearIconPrefixCls = `${prefixCls}-clear`;
    if (clearIcon && React.isValidElement(clearIcon)) {
      return React.cloneElement(clearIcon, {
        className: classNames(clearIcon.props.className, clearIconPrefixCls),
      });
    }
    return <Icon type="close-circle" className={clearIconPrefixCls} theme="filled" />;
  }
  renderTimePicker = locale => (
    <ConfigConsumer>
      {({ getPopupContainer: getContextPopupContainer, getPrefixCls }) => {
        const {
          getPopupContainer,
          prefixCls: customizePrefixCls,
          className,
          addon,
          placeholder,
          ...props
        } = this.props;
        const { size } = props;
        const pickerProps = omit(props, ['defaultValue', 'suffixIcon', 'allowEmpty', 'allowClear']);
        const format = this.getDefaultFormat();
        const prefixCls = getPrefixCls('time-picker', customizePrefixCls);
        const pickerClassName = classNames(className, {
          [`${prefixCls}-${size}`]: !!size,
        });
        const pickerAddon = panel =>
          addon ? <div className={`${prefixCls}-panel-addon`}>{addon(panel)}</div> : null;
        return (
          <RcTimePicker
            {...generateShowHourMinuteSecond(format)}
            {...pickerProps}
            allowEmpty={this.getAllowClear()}
            prefixCls={prefixCls}
            getPopupContainer={getPopupContainer || getContextPopupContainer}
            ref={this.saveTimePicker}
            format={format}
            className={pickerClassName}
            value={this.state.value}
            placeholder={placeholder === undefined ? locale.placeholder : placeholder}
            onChange={this.handleChange}
            onOpen={this.handleOpenClose}
            onClose={this.handleOpenClose}
            addon={pickerAddon}
            inputIcon={this.renderInputIcon(prefixCls)}
            clearIcon={this.renderClearIcon(prefixCls)}
          />
        );
      }}
    </ConfigConsumer>
  );
  render() {
    return (
      <LocaleReceiver componentName="TimePicker" defaultLocale={this.getDefaultLocale()}>
        {this.renderTimePicker}
      </LocaleReceiver>
    );
  }
}
polyfill(TimePicker);
export default TimePicker;
