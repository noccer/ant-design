import * as React from 'react';
import * as moment from 'moment';
import Select from '../select';
import { Group, Button, RadioChangeEvent } from '../radio';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
const { Option } = Select;
function getMonthsLocale(value) {
  const current = value.clone();
  const localeData = value.localeData();
  const months = [];
  for (let i = 0; i < 12; i++) {
    current.month(i);
    months.push(localeData.monthsShort(current));
  }
  return months;
}
export default class Header extends React.Component {
  static defaultProps = {
    yearSelectOffset: 10,
    yearSelectTotal: 20,
  };
  getYearSelectElement(prefixCls, year) {
    const { yearSelectOffset, yearSelectTotal, locale = {}, fullscreen, validRange } = this.props;
    let start = year - yearSelectOffset;
    let end = start + yearSelectTotal;
    if (validRange) {
      start = validRange[0].get('year');
      end = validRange[1].get('year') + 1;
    }
    const suffix = locale.year === '年' ? '年' : '';
    const options = [];
    for (let index = start; index < end; index++) {
      options.push(<Option key={`${index}`}>{index + suffix}</Option>);
    }
    return (
      <Select
        size={fullscreen ? 'default' : 'small'}
        dropdownMatchSelectWidth={false}
        className={`${prefixCls}-year-select`}
        onChange={this.onYearChange}
        value={String(year)}
        getPopupContainer={() => this.calenderHeaderNode}
      >
        {options}
      </Select>
    );
  }
  getMonthSelectElement(prefixCls, month, months) {
    const { fullscreen, validRange, value } = this.props;
    const options = [];
    let start = 0;
    let end = 12;
    if (validRange) {
      const [rangeStart, rangeEnd] = validRange;
      const currentYear = value.get('year');
      if (rangeEnd.get('year') === currentYear) {
        end = rangeEnd.get('month') + 1;
      }
      if (rangeStart.get('year') === currentYear) {
        start = rangeStart.get('month');
      }
    }
    for (let index = start; index < end; index++) {
      options.push(<Option key={`${index}`}>{months[index]}</Option>);
    }
    return (
      <Select
        size={fullscreen ? 'default' : 'small'}
        dropdownMatchSelectWidth={false}
        className={`${prefixCls}-month-select`}
        value={String(month)}
        onChange={this.onMonthChange}
        getPopupContainer={() => this.calenderHeaderNode}
      >
        {options}
      </Select>
    );
  }
  onYearChange = year => {
    const { value, validRange } = this.props;
    const newValue = value.clone();
    newValue.year(parseInt(year, 10));
    // switch the month so that it remains within range when year changes
    if (validRange) {
      const [start, end] = validRange;
      const newYear = newValue.get('year');
      const newMonth = newValue.get('month');
      if (newYear === end.get('year') && newMonth > end.get('month')) {
        newValue.month(end.get('month'));
      }
      if (newYear === start.get('year') && newMonth < start.get('month')) {
        newValue.month(start.get('month'));
      }
    }
    const { onValueChange } = this.props;
    if (onValueChange) {
      onValueChange(newValue);
    }
  };
  onMonthChange = month => {
    const newValue = this.props.value.clone();
    newValue.month(parseInt(month, 10));
    const { onValueChange } = this.props;
    if (onValueChange) {
      onValueChange(newValue);
    }
  };
  onInternalTypeChange = e => {
    this.onTypeChange(e.target.value);
  };
  onTypeChange = type => {
    const { onTypeChange } = this.props;
    if (onTypeChange) {
      onTypeChange(type);
    }
  };
  getCalenderHeaderNode = node => {
    this.calenderHeaderNode = node;
  };
  getMonthYearSelections = getPrefixCls => {
    const { prefixCls: customizePrefixCls, type, value } = this.props;
    const prefixCls = getPrefixCls('fullcalendar', customizePrefixCls);
    const yearReactNode = this.getYearSelectElement(prefixCls, value.year());
    const monthReactNode =
      type === 'month'
        ? this.getMonthSelectElement(prefixCls, value.month(), getMonthsLocale(value))
        : null;
    return {
      yearReactNode,
      monthReactNode,
    };
  };
  getTypeSwitch = () => {
    const { locale = {}, type, fullscreen } = this.props;
    const size = fullscreen ? 'default' : 'small';
    return (
      <Group onChange={this.onInternalTypeChange} value={type} size={size}>
        <Button value="month">{locale.month}</Button>
        <Button value="year">{locale.year}</Button>
      </Group>
    );
  };
  headerRenderCustom = headerRender => {
    const { type, onValueChange, value } = this.props;
    return headerRender({
      value,
      type: type || 'month',
      onChange: onValueChange,
      onTypeChange: this.onTypeChange,
    });
  };
  renderHeader = ({ getPrefixCls }) => {
    const { prefixCls, headerRender } = this.props;
    const typeSwitch = this.getTypeSwitch();
    const { yearReactNode, monthReactNode } = this.getMonthYearSelections(getPrefixCls);
    return headerRender ? (
      this.headerRenderCustom(headerRender)
    ) : (
      <div className={`${prefixCls}-header`} ref={this.getCalenderHeaderNode}>
        {yearReactNode}
        {monthReactNode}
        {typeSwitch}
      </div>
    );
  };
  render() {
    return <ConfigConsumer>{this.renderHeader}</ConfigConsumer>;
  }
}
