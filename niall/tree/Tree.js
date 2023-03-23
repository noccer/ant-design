import * as React from 'react';
import RcTree, { TreeNode } from 'rc-tree';
import classNames from 'classnames';
import DirectoryTree from './DirectoryTree';
import Icon from '../icon';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import collapseMotion from '../_util/motion';
export default class Tree extends React.Component {
  static TreeNode = TreeNode;
  static DirectoryTree = DirectoryTree;
  static defaultProps = {
    checkable: false,
    showIcon: false,
    motion: {
      ...collapseMotion,
      motionAppear: false,
    },
    blockNode: false,
  };
  renderSwitcherIcon = (prefixCls, switcherIcon, { isLeaf, expanded, loading }) => {
    const { showLine } = this.props;
    if (loading) {
      return <Icon type="loading" className={`${prefixCls}-switcher-loading-icon`} />;
    }
    if (isLeaf) {
      return showLine ? <Icon type="file" className={`${prefixCls}-switcher-line-icon`} /> : null;
    }
    const switcherCls = `${prefixCls}-switcher-icon`;
    if (switcherIcon) {
      return React.cloneElement(switcherIcon, {
        className: classNames(switcherIcon.props.className || '', switcherCls),
      });
    }
    return showLine ? (
      <Icon
        type={expanded ? 'minus-square' : 'plus-square'}
        className={`${prefixCls}-switcher-line-icon`}
        theme="outlined"
      />
    ) : (
      <Icon type="caret-down" className={switcherCls} theme="filled" />
    );
  };
  setTreeRef = node => {
    this.tree = node;
  };
  renderTree = ({ getPrefixCls }) => {
    const { props } = this;
    const {
      prefixCls: customizePrefixCls,
      className,
      showIcon,
      switcherIcon,
      blockNode,
      children,
    } = props;
    const { checkable } = props;
    const prefixCls = getPrefixCls('tree', customizePrefixCls);
    return (
      <RcTree
        ref={this.setTreeRef}
        {...props}
        prefixCls={prefixCls}
        className={classNames(className, {
          [`${prefixCls}-icon-hide`]: !showIcon,
          [`${prefixCls}-block-node`]: blockNode,
        })}
        checkable={checkable ? <span className={`${prefixCls}-checkbox-inner`} /> : checkable}
        switcherIcon={nodeProps => this.renderSwitcherIcon(prefixCls, switcherIcon, nodeProps)}
      >
        {children}
      </RcTree>
    );
  };
  render() {
    return <ConfigConsumer>{this.renderTree}</ConfigConsumer>;
  }
}
