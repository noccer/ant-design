import * as React from 'react';
import * as PropTypes from 'prop-types';
import classNames from 'classnames';
import { ListGridType, ColumnType } from './index';
import { Col } from '../grid';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import { cloneElement } from '../_util/reactNode';
export const Meta = props => (
  <ConfigConsumer>
    {({ getPrefixCls }) => {
      const {
        prefixCls: customizePrefixCls,
        className,
        avatar,
        title,
        description,
        ...others
      } = props;
      const prefixCls = getPrefixCls('list', customizePrefixCls);
      const classString = classNames(`${prefixCls}-item-meta`, className);
      const content = (
        <div className={`${prefixCls}-item-meta-content`}>
          {title && <h4 className={`${prefixCls}-item-meta-title`}>{title}</h4>}
          {description && <div className={`${prefixCls}-item-meta-description`}>{description}</div>}
        </div>
      );
      return (
        <div {...others} className={classString}>
          {avatar && <div className={`${prefixCls}-item-meta-avatar`}>{avatar}</div>}
          {(title || description) && content}
        </div>
      );
    }}
  </ConfigConsumer>
);
function getGrid(grid, t) {
  return grid[t] && Math.floor(24 / grid[t]);
}
export default class Item extends React.Component {
  static Meta = Meta;
  static contextTypes = {
    grid: PropTypes.any,
    itemLayout: PropTypes.string,
  };
  isItemContainsTextNodeAndNotSingular() {
    const { children } = this.props;
    let result;
    React.Children.forEach(children, element => {
      if (typeof element === 'string') {
        result = true;
      }
    });
    return result && React.Children.count(children) > 1;
  }
  isFlexMode() {
    const { extra } = this.props;
    const { itemLayout } = this.context;
    if (itemLayout === 'vertical') {
      return !!extra;
    }
    return !this.isItemContainsTextNodeAndNotSingular();
  }
  renderItem = ({ getPrefixCls }) => {
    const { grid, itemLayout } = this.context;
    const {
      prefixCls: customizePrefixCls,
      children,
      actions,
      extra,
      className,
      ...others
    } = this.props;
    const prefixCls = getPrefixCls('list', customizePrefixCls);
    const actionsContent = actions && actions.length > 0 && (
      <ul className={`${prefixCls}-item-action`} key="actions">
        {actions.map((action, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={`${prefixCls}-item-action-${i}`}>
            {action}
            {i !== actions.length - 1 && <em className={`${prefixCls}-item-action-split`} />}
          </li>
        ))}
      </ul>
    );
    const Tag = grid ? 'div' : 'li';
    const itemChildren = (
      <Tag
        {...others} // `li` element `onCopy` prop args is not same as `div`
        className={classNames(`${prefixCls}-item`, className, {
          [`${prefixCls}-item-no-flex`]: !this.isFlexMode(),
        })}
      >
        {itemLayout === 'vertical' && extra
          ? [
              <div className={`${prefixCls}-item-main`} key="content">
                {children}
                {actionsContent}
              </div>,
              <div className={`${prefixCls}-item-extra`} key="extra">
                {extra}
              </div>,
            ]
          : [
              children,
              actionsContent,
              cloneElement(extra, {
                key: 'extra',
              }),
            ]}
      </Tag>
    );
    return grid ? (
      <Col
        span={getGrid(grid, 'column')}
        xs={getGrid(grid, 'xs')}
        sm={getGrid(grid, 'sm')}
        md={getGrid(grid, 'md')}
        lg={getGrid(grid, 'lg')}
        xl={getGrid(grid, 'xl')}
        xxl={getGrid(grid, 'xxl')}
      >
        {itemChildren}
      </Col>
    ) : (
      itemChildren
    );
  };
  render() {
    return <ConfigConsumer>{this.renderItem}</ConfigConsumer>;
  }
}
