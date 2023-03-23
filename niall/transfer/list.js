import * as React from 'react';
import * as ReactDOM from 'react-dom';
import omit from 'omit.js';
import classNames from 'classnames';
import PureRenderMixin from 'rc-util/lib/PureRenderMixin';
import Checkbox from '../checkbox';
import { TransferItem, TransferDirection, RenderResult, RenderResultObject } from './index';
import Search from './search';
import defaultRenderList, { TransferListBodyProps, OmitProps } from './renderListBody';
import triggerEvent from '../_util/triggerEvent';
const defaultRender = () => null;
function isRenderResultPlainObject(result) {
  return (
    result &&
    !React.isValidElement(result) &&
    Object.prototype.toString.call(result) === '[object Object]'
  );
}
function renderListNode(renderList, props) {
  let bodyContent = renderList ? renderList(props) : null;
  const customize = !!bodyContent;
  if (!customize) {
    bodyContent = defaultRenderList(props);
  }
  return {
    customize,
    bodyContent,
  };
}
export default class TransferList extends React.Component {
  static defaultProps = {
    dataSource: [],
    titleText: '',
    showSearch: false,
    lazy: {},
  };
  constructor(props) {
    super(props);
    this.state = {
      filterValue: '',
    };
  }
  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }
  componentWillUnmount() {
    clearTimeout(this.triggerScrollTimer);
  }
  getCheckStatus(filteredItems) {
    const { checkedKeys } = this.props;
    if (checkedKeys.length === 0) {
      return 'none';
    }
    if (filteredItems.every(item => checkedKeys.indexOf(item.key) >= 0 || !!item.disabled)) {
      return 'all';
    }
    return 'part';
  }
  getFilteredItems(dataSource, filterValue) {
    const filteredItems = [];
    const filteredRenderItems = [];
    dataSource.forEach(item => {
      const renderedItem = this.renderItem(item);
      const { renderedText } = renderedItem;

      // Filter skip
      if (filterValue && filterValue.trim() && !this.matchFilter(renderedText, item)) {
        return null;
      }
      filteredItems.push(item);
      filteredRenderItems.push(renderedItem);
    });
    return {
      filteredItems,
      filteredRenderItems,
    };
  }
  getListBody(
    prefixCls,
    searchPlaceholder,
    filterValue,
    filteredItems,
    notFoundContent,
    bodyDom,
    filteredRenderItems,
    checkedKeys,
    renderList,
    showSearch,
    disabled,
  ) {
    const search = showSearch ? (
      <div className={`${prefixCls}-body-search-wrapper`}>
        <Search
          prefixCls={`${prefixCls}-search`}
          onChange={this.handleFilter}
          handleClear={this.handleClear}
          placeholder={searchPlaceholder}
          value={filterValue}
          disabled={disabled}
        />
      </div>
    ) : null;
    let listBody = bodyDom;
    if (!listBody) {
      let bodyNode;
      const { bodyContent, customize } = renderListNode(renderList, {
        ...omit(this.props, OmitProps),
        filteredItems,
        filteredRenderItems,
        selectedKeys: checkedKeys,
      });

      // We should wrap customize list body in a classNamed div to use flex layout.
      if (customize) {
        bodyNode = <div className={`${prefixCls}-body-customize-wrapper`}>{bodyContent}</div>;
      } else {
        bodyNode = filteredItems.length ? (
          bodyContent
        ) : (
          <div className={`${prefixCls}-body-not-found`}>{notFoundContent}</div>
        );
      }
      listBody = (
        <div
          className={classNames(
            showSearch ? `${prefixCls}-body ${prefixCls}-body-with-search` : `${prefixCls}-body`,
          )}
        >
          {search}
          {bodyNode}
        </div>
      );
    }
    return listBody;
  }
  getCheckBox(filteredItems, onItemSelectAll, showSelectAll, disabled) {
    const checkStatus = this.getCheckStatus(filteredItems);
    const checkedAll = checkStatus === 'all';
    const checkAllCheckbox = showSelectAll !== false && (
      <Checkbox
        disabled={disabled}
        checked={checkedAll}
        indeterminate={checkStatus === 'part'}
        onChange={() => {
          // Only select enabled items
          onItemSelectAll(
            filteredItems.filter(item => !item.disabled).map(({ key }) => key),
            !checkedAll,
          );
        }}
      />
    );
    return checkAllCheckbox;
  }
  handleFilter = e => {
    const { handleFilter } = this.props;
    const {
      target: { value: filterValue },
    } = e;
    this.setState({
      filterValue,
    });
    handleFilter(e);
    if (!filterValue) {
      return;
    }
    // Manually trigger scroll event for lazy search bug
    // https://github.com/ant-design/ant-design/issues/5631
    this.triggerScrollTimer = window.setTimeout(() => {
      const transferNode = ReactDOM.findDOMNode(this);
      const listNode = transferNode.querySelectorAll('.ant-transfer-list-content')[0];
      if (listNode) {
        triggerEvent(listNode, 'scroll');
      }
    }, 0);
  };
  handleClear = () => {
    const { handleClear } = this.props;
    this.setState({
      filterValue: '',
    });
    handleClear();
  };
  matchFilter = (text, item) => {
    const { filterValue } = this.state;
    const { filterOption } = this.props;
    if (filterOption) {
      return filterOption(filterValue, item);
    }
    return text.indexOf(filterValue) >= 0;
  };
  renderItem = item => {
    const { render = defaultRender } = this.props;
    const renderResult = render(item);
    const isRenderResultPlain = isRenderResultPlainObject(renderResult);
    return {
      renderedText: isRenderResultPlain ? renderResult.value : renderResult,
      renderedEl: isRenderResultPlain ? renderResult.label : renderResult,
      item,
    };
  };
  render() {
    const { filterValue } = this.state;
    const {
      prefixCls,
      dataSource,
      titleText,
      checkedKeys,
      disabled,
      body,
      footer,
      showSearch,
      style,
      searchPlaceholder,
      notFoundContent,
      itemUnit,
      itemsUnit,
      renderList,
      onItemSelectAll,
      showSelectAll,
    } = this.props;

    // Custom Layout
    const footerDom = footer && footer(this.props);
    const bodyDom = body && body(this.props);
    const listCls = classNames(prefixCls, {
      [`${prefixCls}-with-footer`]: !!footerDom,
    });

    // ====================== Get filtered, checked item list ======================

    const { filteredItems, filteredRenderItems } = this.getFilteredItems(dataSource, filterValue);

    // ================================= List Body =================================
    const unit = dataSource.length > 1 ? itemsUnit : itemUnit;
    const listBody = this.getListBody(
      prefixCls,
      searchPlaceholder,
      filterValue,
      filteredItems,
      notFoundContent,
      bodyDom,
      filteredRenderItems,
      checkedKeys,
      renderList,
      showSearch,
      disabled,
    );

    // ================================ List Footer ================================
    const listFooter = footerDom ? <div className={`${prefixCls}-footer`}>{footerDom}</div> : null;
    const checkAllCheckbox = this.getCheckBox(
      filteredItems,
      onItemSelectAll,
      showSelectAll,
      disabled,
    );

    // ================================== Render ===================================
    return (
      <div className={listCls} style={style}>
        {/* Header */}
        <div className={`${prefixCls}-header`}>
          {checkAllCheckbox}
          <span className={`${prefixCls}-header-selected`}>
            <span>
              {(checkedKeys.length > 0 ? `${checkedKeys.length}/` : '') + filteredItems.length}{' '}
              {unit}
            </span>
            <span className={`${prefixCls}-header-title`}>{titleText}</span>
          </span>
        </div>

        {/* Body */}
        {listBody}

        {/* Footer */}
        {listFooter}
      </div>
    );
  }
}
