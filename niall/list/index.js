import * as React from 'react';
import * as PropTypes from 'prop-types';
import classNames from 'classnames';
import omit from 'omit.js';
import Spin, { SpinProps } from '../spin';
import { ConfigConsumer, ConfigConsumerProps, RenderEmptyHandler } from '../config-provider';
import Pagination, { PaginationConfig } from '../pagination';
import { Row } from '../grid';
import Item from './Item';
export { ListItemProps, ListItemMetaProps } from './Item';
export default class List extends React.Component {
  static Item = Item;
  static childContextTypes = {
    grid: PropTypes.any,
    itemLayout: PropTypes.string,
  };
  static defaultProps = {
    dataSource: [],
    bordered: false,
    split: true,
    loading: false,
    pagination: false,
  };
  defaultPaginationProps = {
    current: 1,
    total: 0,
  };
  keys = {};
  onPaginationChange = this.triggerPaginationEvent('onChange');
  onPaginationShowSizeChange = this.triggerPaginationEvent('onShowSizeChange');
  constructor(props) {
    super(props);
    const { pagination } = props;
    const paginationObj = pagination && typeof pagination === 'object' ? pagination : {};
    this.state = {
      paginationCurrent: paginationObj.defaultCurrent || 1,
      paginationSize: paginationObj.defaultPageSize || 10,
    };
  }
  getChildContext() {
    return {
      grid: this.props.grid,
      itemLayout: this.props.itemLayout,
    };
  }
  triggerPaginationEvent(eventName) {
    return (page, pageSize) => {
      const { pagination } = this.props;
      this.setState({
        paginationCurrent: page,
        paginationSize: pageSize,
      });
      if (pagination && pagination[eventName]) {
        pagination[eventName](page, pageSize);
      }
    };
  }
  renderItem = (item, index) => {
    const { renderItem, rowKey } = this.props;
    if (!renderItem) return null;
    let key;
    if (typeof rowKey === 'function') {
      key = rowKey(item);
    } else if (typeof rowKey === 'string') {
      key = item[rowKey];
    } else {
      key = item.key;
    }
    if (!key) {
      key = `list-item-${index}`;
    }
    this.keys[index] = key;
    return renderItem(item, index);
  };
  isSomethingAfterLastItem() {
    const { loadMore, pagination, footer } = this.props;
    return !!(loadMore || pagination || footer);
  }
  renderEmpty = (prefixCls, renderEmpty) => {
    const { locale } = this.props;
    return (
      <div className={`${prefixCls}-empty-text`}>
        {(locale && locale.emptyText) || renderEmpty('List')}
      </div>
    );
  };
  renderList = ({ getPrefixCls, renderEmpty }) => {
    const { paginationCurrent, paginationSize } = this.state;
    const {
      prefixCls: customizePrefixCls,
      bordered,
      split,
      className,
      children,
      itemLayout,
      loadMore,
      pagination,
      grid,
      dataSource = [],
      size,
      header,
      footer,
      loading,
      ...rest
    } = this.props;
    const prefixCls = getPrefixCls('list', customizePrefixCls);
    let loadingProp = loading;
    if (typeof loadingProp === 'boolean') {
      loadingProp = {
        spinning: loadingProp,
      };
    }
    const isLoading = loadingProp && loadingProp.spinning;

    // large => lg
    // small => sm
    let sizeCls = '';
    switch (size) {
      case 'large':
        sizeCls = 'lg';
        break;
      case 'small':
        sizeCls = 'sm';
        break;
      default:
        break;
    }
    const classString = classNames(prefixCls, className, {
      [`${prefixCls}-vertical`]: itemLayout === 'vertical',
      [`${prefixCls}-${sizeCls}`]: sizeCls,
      [`${prefixCls}-split`]: split,
      [`${prefixCls}-bordered`]: bordered,
      [`${prefixCls}-loading`]: isLoading,
      [`${prefixCls}-grid`]: grid,
      [`${prefixCls}-something-after-last-item`]: this.isSomethingAfterLastItem(),
    });
    const paginationProps = {
      ...this.defaultPaginationProps,
      total: dataSource.length,
      current: paginationCurrent,
      pageSize: paginationSize,
      ...(pagination || {}),
    };
    const largestPage = Math.ceil(paginationProps.total / paginationProps.pageSize);
    if (paginationProps.current > largestPage) {
      paginationProps.current = largestPage;
    }
    const paginationContent = pagination ? (
      <div className={`${prefixCls}-pagination`}>
        <Pagination
          {...paginationProps}
          onChange={this.onPaginationChange}
          onShowSizeChange={this.onPaginationShowSizeChange}
        />
      </div>
    ) : null;
    let splitDataSource = [...dataSource];
    if (pagination) {
      if (dataSource.length > (paginationProps.current - 1) * paginationProps.pageSize) {
        splitDataSource = [...dataSource].splice(
          (paginationProps.current - 1) * paginationProps.pageSize,
          paginationProps.pageSize,
        );
      }
    }
    let childrenContent;
    childrenContent = isLoading && (
      <div
        style={{
          minHeight: 53,
        }}
      />
    );
    if (splitDataSource.length > 0) {
      const items = splitDataSource.map((item, index) => this.renderItem(item, index));
      const childrenList = [];
      React.Children.forEach(items, (child, index) => {
        childrenList.push(
          React.cloneElement(child, {
            key: this.keys[index],
          }),
        );
      });
      childrenContent = grid ? (
        <Row gutter={grid.gutter}>{childrenList}</Row>
      ) : (
        <ul className={`${prefixCls}-items`}>{childrenList}</ul>
      );
    } else if (!children && !isLoading) {
      childrenContent = this.renderEmpty(prefixCls, renderEmpty);
    }
    const paginationPosition = paginationProps.position || 'bottom';
    return (
      <div className={classString} {...omit(rest, ['rowKey', 'renderItem', 'locale'])}>
        {(paginationPosition === 'top' || paginationPosition === 'both') && paginationContent}
        {header && <div className={`${prefixCls}-header`}>{header}</div>}
        <Spin {...loadingProp}>
          {childrenContent}
          {children}
        </Spin>
        {footer && <div className={`${prefixCls}-footer`}>{footer}</div>}
        {loadMore ||
          ((paginationPosition === 'bottom' || paginationPosition === 'both') && paginationContent)}
      </div>
    );
  };
  render() {
    return <ConfigConsumer>{this.renderList}</ConfigConsumer>;
  }
}
