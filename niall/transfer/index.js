import * as React from 'react';
import * as PropTypes from 'prop-types';
import classNames from 'classnames';
import { polyfill } from 'react-lifecycles-compat';
import List, { TransferListProps } from './list';
import Operation from './operation';
import Search from './search';
import warning from '../_util/warning';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import defaultLocale from '../locale/default';
import { ConfigConsumer, ConfigConsumerProps, RenderEmptyHandler } from '../config-provider';
import { TransferListBodyProps } from './renderListBody';
export { TransferListProps } from './list';
export { TransferOperationProps } from './operation';
export { TransferSearchProps } from './search';
class Transfer extends React.Component {
  // For high-level customized Transfer @dqaria
  static List = List;
  static Operation = Operation;
  static Search = Search;
  static defaultProps = {
    dataSource: [],
    locale: {},
    showSearch: false,
    listStyle: () => {},
  };
  static propTypes = {
    prefixCls: PropTypes.string,
    disabled: PropTypes.bool,
    dataSource: PropTypes.array,
    render: PropTypes.func,
    targetKeys: PropTypes.array,
    onChange: PropTypes.func,
    height: PropTypes.number,
    style: PropTypes.object,
    listStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    operationStyle: PropTypes.object,
    className: PropTypes.string,
    titles: PropTypes.array,
    operations: PropTypes.array,
    showSearch: PropTypes.bool,
    filterOption: PropTypes.func,
    searchPlaceholder: PropTypes.string,
    notFoundContent: PropTypes.node,
    locale: PropTypes.object,
    body: PropTypes.func,
    footer: PropTypes.func,
    rowKey: PropTypes.func,
    lazy: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  };
  static getDerivedStateFromProps(nextProps) {
    if (nextProps.selectedKeys) {
      const targetKeys = nextProps.targetKeys || [];
      return {
        sourceSelectedKeys: nextProps.selectedKeys.filter(key => !targetKeys.includes(key)),
        targetSelectedKeys: nextProps.selectedKeys.filter(key => targetKeys.includes(key)),
      };
    }
    return null;
  }
  separatedDataSource = null;
  constructor(props) {
    super(props);
    warning(
      !('notFoundContent' in props || 'searchPlaceholder' in props),
      'Transfer',
      '`notFoundContent` and `searchPlaceholder` will be removed, ' +
        'please use `locale` instead.',
    );
    warning(
      !('body' in props),
      'Transfer',
      '`body` is internal usage and will bre removed, please use `children` instead.',
    );
    const { selectedKeys = [], targetKeys = [] } = props;
    this.state = {
      sourceSelectedKeys: selectedKeys.filter(key => targetKeys.indexOf(key) === -1),
      targetSelectedKeys: selectedKeys.filter(key => targetKeys.indexOf(key) > -1),
    };
  }

  // eslint-disable-next-line
  getSelectedKeysName(direction) {
    return direction === 'left' ? 'sourceSelectedKeys' : 'targetSelectedKeys';
  }
  getTitles(transferLocale) {
    const { props } = this;
    if (props.titles) {
      return props.titles;
    }
    return transferLocale.titles;
  }
  getLocale = (transferLocale, renderEmpty) => {
    // Keep old locale props still working.
    const oldLocale = {
      notFoundContent: renderEmpty('Transfer'),
    };
    if ('notFoundContent' in this.props) {
      oldLocale.notFoundContent = this.props.notFoundContent;
    }
    if ('searchPlaceholder' in this.props) {
      oldLocale.searchPlaceholder = this.props.searchPlaceholder;
    }
    return {
      ...transferLocale,
      ...oldLocale,
      ...this.props.locale,
    };
  };
  moveTo = direction => {
    const { targetKeys = [], dataSource = [], onChange } = this.props;
    const { sourceSelectedKeys, targetSelectedKeys } = this.state;
    const moveKeys = direction === 'right' ? sourceSelectedKeys : targetSelectedKeys;
    // filter the disabled options
    const newMoveKeys = moveKeys.filter(
      key => !dataSource.some(data => !!(key === data.key && data.disabled)),
    );
    // move items to target box
    const newTargetKeys =
      direction === 'right'
        ? newMoveKeys.concat(targetKeys)
        : targetKeys.filter(targetKey => newMoveKeys.indexOf(targetKey) === -1);

    // empty checked keys
    const oppositeDirection = direction === 'right' ? 'left' : 'right';
    this.setState({
      [this.getSelectedKeysName(oppositeDirection)]: [],
    });
    this.handleSelectChange(oppositeDirection, []);
    if (onChange) {
      onChange(newTargetKeys, direction, newMoveKeys);
    }
  };
  moveToLeft = () => this.moveTo('left');
  moveToRight = () => this.moveTo('right');
  onItemSelectAll = (direction, selectedKeys, checkAll) => {
    const originalSelectedKeys = this.state[this.getSelectedKeysName(direction)] || [];
    let mergedCheckedKeys = [];
    if (checkAll) {
      // Merge current keys with origin key
      mergedCheckedKeys = Array.from(new Set([...originalSelectedKeys, ...selectedKeys]));
    } else {
      // Remove current keys from origin keys
      mergedCheckedKeys = originalSelectedKeys.filter(key => selectedKeys.indexOf(key) === -1);
    }
    this.handleSelectChange(direction, mergedCheckedKeys);
    if (!this.props.selectedKeys) {
      this.setState({
        [this.getSelectedKeysName(direction)]: mergedCheckedKeys,
      });
    }
  };
  handleSelectAll = (direction, filteredDataSource, checkAll) => {
    warning(
      false,
      'Transfer',
      '`handleSelectAll` will be removed, please use `onSelectAll` instead.',
    );
    this.onItemSelectAll(
      direction,
      filteredDataSource.map(({ key }) => key),
      !checkAll,
    );
  };

  // [Legacy] Old prop `body` pass origin check as arg. It's confusing.
  // TODO: Remove this in next version.
  handleLeftSelectAll = (filteredDataSource, checkAll) =>
    this.handleSelectAll('left', filteredDataSource, !checkAll);
  handleRightSelectAll = (filteredDataSource, checkAll) =>
    this.handleSelectAll('right', filteredDataSource, !checkAll);
  onLeftItemSelectAll = (selectedKeys, checkAll) =>
    this.onItemSelectAll('left', selectedKeys, checkAll);
  onRightItemSelectAll = (selectedKeys, checkAll) =>
    this.onItemSelectAll('right', selectedKeys, checkAll);
  handleFilter = (direction, e) => {
    const { onSearchChange, onSearch } = this.props;
    const { value } = e.target;
    if (onSearchChange) {
      warning(false, 'Transfer', '`onSearchChange` is deprecated. Please use `onSearch` instead.');
      onSearchChange(direction, e);
    }
    if (onSearch) {
      onSearch(direction, value);
    }
  };
  handleLeftFilter = e => this.handleFilter('left', e);
  handleRightFilter = e => this.handleFilter('right', e);
  handleClear = direction => {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch(direction, '');
    }
  };
  handleLeftClear = () => this.handleClear('left');
  handleRightClear = () => this.handleClear('right');
  onItemSelect = (direction, selectedKey, checked) => {
    const { sourceSelectedKeys, targetSelectedKeys } = this.state;
    const holder = direction === 'left' ? [...sourceSelectedKeys] : [...targetSelectedKeys];
    const index = holder.indexOf(selectedKey);
    if (index > -1) {
      holder.splice(index, 1);
    }
    if (checked) {
      holder.push(selectedKey);
    }
    this.handleSelectChange(direction, holder);
    if (!this.props.selectedKeys) {
      this.setState({
        [this.getSelectedKeysName(direction)]: holder,
      });
    }
  };
  handleSelect = (direction, selectedItem, checked) => {
    warning(false, 'Transfer', '`handleSelect` will be removed, please use `onSelect` instead.');
    this.onItemSelect(direction, selectedItem.key, checked);
  };
  handleLeftSelect = (selectedItem, checked) => this.handleSelect('left', selectedItem, checked);
  handleRightSelect = (selectedItem, checked) => this.handleSelect('right', selectedItem, checked);
  onLeftItemSelect = (selectedKey, checked) => this.onItemSelect('left', selectedKey, checked);
  onRightItemSelect = (selectedKey, checked) => this.onItemSelect('right', selectedKey, checked);
  handleScroll = (direction, e) => {
    const { onScroll } = this.props;
    if (onScroll) {
      onScroll(direction, e);
    }
  };
  handleLeftScroll = e => this.handleScroll('left', e);
  handleRightScroll = e => this.handleScroll('right', e);
  handleSelectChange(direction, holder) {
    const { sourceSelectedKeys, targetSelectedKeys } = this.state;
    const { onSelectChange } = this.props;
    if (!onSelectChange) {
      return;
    }
    if (direction === 'left') {
      onSelectChange(holder, targetSelectedKeys);
    } else {
      onSelectChange(sourceSelectedKeys, holder);
    }
  }
  handleListStyle = (listStyle, direction) => {
    if (typeof listStyle === 'function') {
      return listStyle({
        direction,
      });
    }
    return listStyle;
  };
  separateDataSource() {
    const { dataSource, rowKey, targetKeys = [] } = this.props;
    const leftDataSource = [];
    const rightDataSource = new Array(targetKeys.length);
    dataSource.forEach(record => {
      if (rowKey) {
        record.key = rowKey(record);
      }

      // rightDataSource should be ordered by targetKeys
      // leftDataSource should be ordered by dataSource
      const indexOfKey = targetKeys.indexOf(record.key);
      if (indexOfKey !== -1) {
        rightDataSource[indexOfKey] = record;
      } else {
        leftDataSource.push(record);
      }
    });
    return {
      leftDataSource,
      rightDataSource,
    };
  }
  renderTransfer = transferLocale => (
    <ConfigConsumer>
      {({ getPrefixCls, renderEmpty }) => {
        const {
          prefixCls: customizePrefixCls,
          className,
          disabled,
          operations = [],
          showSearch,
          body,
          footer,
          style,
          listStyle,
          operationStyle,
          filterOption,
          render,
          lazy,
          children,
          showSelectAll,
        } = this.props;
        const prefixCls = getPrefixCls('transfer', customizePrefixCls);
        const locale = this.getLocale(transferLocale, renderEmpty);
        const { sourceSelectedKeys, targetSelectedKeys } = this.state;
        const { leftDataSource, rightDataSource } = this.separateDataSource();
        const leftActive = targetSelectedKeys.length > 0;
        const rightActive = sourceSelectedKeys.length > 0;
        const cls = classNames(className, prefixCls, {
          [`${prefixCls}-disabled`]: disabled,
          [`${prefixCls}-customize-list`]: !!children,
        });
        const titles = this.getTitles(locale);
        return (
          <div className={cls} style={style}>
            <List
              prefixCls={`${prefixCls}-list`}
              titleText={titles[0]}
              dataSource={leftDataSource}
              filterOption={filterOption}
              style={this.handleListStyle(listStyle, 'left')}
              checkedKeys={sourceSelectedKeys}
              handleFilter={this.handleLeftFilter}
              handleClear={this.handleLeftClear}
              handleSelect={this.handleLeftSelect}
              handleSelectAll={this.handleLeftSelectAll}
              onItemSelect={this.onLeftItemSelect}
              onItemSelectAll={this.onLeftItemSelectAll}
              render={render}
              showSearch={showSearch}
              body={body}
              renderList={children}
              footer={footer}
              lazy={lazy}
              onScroll={this.handleLeftScroll}
              disabled={disabled}
              direction="left"
              showSelectAll={showSelectAll}
              {...locale}
            />
            <Operation
              className={`${prefixCls}-operation`}
              rightActive={rightActive}
              rightArrowText={operations[0]}
              moveToRight={this.moveToRight}
              leftActive={leftActive}
              leftArrowText={operations[1]}
              moveToLeft={this.moveToLeft}
              style={operationStyle}
              disabled={disabled}
            />
            <List
              prefixCls={`${prefixCls}-list`}
              titleText={titles[1]}
              dataSource={rightDataSource}
              filterOption={filterOption}
              style={this.handleListStyle(listStyle, 'right')}
              checkedKeys={targetSelectedKeys}
              handleFilter={this.handleRightFilter}
              handleClear={this.handleRightClear}
              handleSelect={this.handleRightSelect}
              handleSelectAll={this.handleRightSelectAll}
              onItemSelect={this.onRightItemSelect}
              onItemSelectAll={this.onRightItemSelectAll}
              render={render}
              showSearch={showSearch}
              body={body}
              renderList={children}
              footer={footer}
              lazy={lazy}
              onScroll={this.handleRightScroll}
              disabled={disabled}
              direction="right"
              showSelectAll={showSelectAll}
              {...locale}
            />
          </div>
        );
      }}
    </ConfigConsumer>
  );
  render() {
    return (
      <LocaleReceiver componentName="Transfer" defaultLocale={defaultLocale.Transfer}>
        {this.renderTransfer}
      </LocaleReceiver>
    );
  }
}
polyfill(Transfer);
export default Transfer;
