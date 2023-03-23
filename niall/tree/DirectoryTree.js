import * as React from 'react';
import classNames from 'classnames';
import omit from 'omit.js';
import debounce from 'lodash/debounce';
import { conductExpandParent, convertTreeToEntities } from 'rc-tree/lib/util';
import { polyfill } from 'react-lifecycles-compat';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import Tree, {
  TreeProps,
  AntdTreeNodeAttribute,
  AntTreeNodeExpandedEvent,
  AntTreeNodeSelectedEvent,
  AntTreeNode,
} from './Tree';
import {
  calcRangeKeys,
  getFullKeyList,
  convertDirectoryKeysToNodes,
  getFullKeyListByTreeData,
} from './util';
import Icon from '../icon';
function getIcon(props) {
  const { isLeaf, expanded } = props;
  if (isLeaf) {
    return <Icon type="file" />;
  }
  return <Icon type={expanded ? 'folder-open' : 'folder'} />;
}
class DirectoryTree extends React.Component {
  static defaultProps = {
    showIcon: true,
    expandAction: 'click',
  };
  static getDerivedStateFromProps(nextProps) {
    const newState = {};
    if ('expandedKeys' in nextProps) {
      newState.expandedKeys = nextProps.expandedKeys;
    }
    if ('selectedKeys' in nextProps) {
      newState.selectedKeys = nextProps.selectedKeys;
    }
    return newState;
  }
  constructor(props) {
    super(props);
    const {
      defaultExpandAll,
      defaultExpandParent,
      expandedKeys,
      defaultExpandedKeys,
      children,
    } = props;
    const { keyEntities } = convertTreeToEntities(children);

    // Selected keys
    this.state = {
      selectedKeys: props.selectedKeys || props.defaultSelectedKeys || [],
    };

    // Expanded keys
    if (defaultExpandAll) {
      if (props.treeData) {
        this.state.expandedKeys = getFullKeyListByTreeData(props.treeData);
      } else {
        this.state.expandedKeys = getFullKeyList(props.children);
      }
    } else if (defaultExpandParent) {
      this.state.expandedKeys = conductExpandParent(
        expandedKeys || defaultExpandedKeys,
        keyEntities,
      );
    } else {
      this.state.expandedKeys = expandedKeys || defaultExpandedKeys;
    }
    this.onDebounceExpand = debounce(this.expandFolderNode, 200, {
      leading: true,
    });
  }
  onExpand = (expandedKeys, info) => {
    const { onExpand } = this.props;
    this.setUncontrolledState({
      expandedKeys,
    });

    // Call origin function
    if (onExpand) {
      return onExpand(expandedKeys, info);
    }
    return undefined;
  };
  onClick = (event, node) => {
    const { onClick, expandAction } = this.props;

    // Expand the tree
    if (expandAction === 'click') {
      this.onDebounceExpand(event, node);
    }
    if (onClick) {
      onClick(event, node);
    }
  };
  onDoubleClick = (event, node) => {
    const { onDoubleClick, expandAction } = this.props;

    // Expand the tree
    if (expandAction === 'doubleClick') {
      this.onDebounceExpand(event, node);
    }
    if (onDoubleClick) {
      onDoubleClick(event, node);
    }
  };
  onSelect = (keys, event) => {
    const { onSelect, multiple, children } = this.props;
    const { expandedKeys = [] } = this.state;
    const { node, nativeEvent } = event;
    const { eventKey = '' } = node.props;
    const newState = {};

    // We need wrap this event since some value is not same
    const newEvent = {
      ...event,
      selected: true, // Directory selected always true
    };

    // Windows / Mac single pick
    const ctrlPick = nativeEvent.ctrlKey || nativeEvent.metaKey;
    const shiftPick = nativeEvent.shiftKey;

    // Generate new selected keys
    let newSelectedKeys;
    if (multiple && ctrlPick) {
      // Control click
      newSelectedKeys = keys;
      this.lastSelectedKey = eventKey;
      this.cachedSelectedKeys = newSelectedKeys;
      newEvent.selectedNodes = convertDirectoryKeysToNodes(children, newSelectedKeys);
    } else if (multiple && shiftPick) {
      // Shift click
      newSelectedKeys = Array.from(
        new Set([
          ...(this.cachedSelectedKeys || []),
          ...calcRangeKeys(children, expandedKeys, eventKey, this.lastSelectedKey),
        ]),
      );
      newEvent.selectedNodes = convertDirectoryKeysToNodes(children, newSelectedKeys);
    } else {
      // Single click
      newSelectedKeys = [eventKey];
      this.lastSelectedKey = eventKey;
      this.cachedSelectedKeys = newSelectedKeys;
      newEvent.selectedNodes = [event.node];
    }
    newState.selectedKeys = newSelectedKeys;
    if (onSelect) {
      onSelect(newSelectedKeys, newEvent);
    }
    this.setUncontrolledState(newState);
  };
  setTreeRef = node => {
    this.tree = node;
  };
  expandFolderNode = (event, node) => {
    const { isLeaf } = node.props;
    if (isLeaf || event.shiftKey || event.metaKey || event.ctrlKey) {
      return;
    }

    // Get internal rc-tree
    const internalTree = this.tree.tree;

    // Call internal rc-tree expand function
    // https://github.com/ant-design/ant-design/issues/12567
    internalTree.onNodeExpand(event, node);
  };
  setUncontrolledState = state => {
    const newState = omit(state, Object.keys(this.props));
    if (Object.keys(newState).length) {
      this.setState(newState);
    }
  };
  renderDirectoryTree = ({ getPrefixCls }) => {
    const { prefixCls: customizePrefixCls, className, ...props } = this.props;
    const { expandedKeys, selectedKeys } = this.state;
    const prefixCls = getPrefixCls('tree', customizePrefixCls);
    const connectClassName = classNames(`${prefixCls}-directory`, className);
    return (
      <Tree
        icon={getIcon}
        ref={this.setTreeRef}
        {...props}
        prefixCls={prefixCls}
        className={connectClassName}
        expandedKeys={expandedKeys}
        selectedKeys={selectedKeys}
        onSelect={this.onSelect}
        onClick={this.onClick}
        onDoubleClick={this.onDoubleClick}
        onExpand={this.onExpand}
      />
    );
  };
  render() {
    return <ConfigConsumer>{this.renderDirectoryTree}</ConfigConsumer>;
  }
}
polyfill(DirectoryTree);
export default DirectoryTree;
