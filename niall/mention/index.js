import * as React from 'react';
import RcMention, { Nav, toString, toEditorState, getMentions } from 'rc-editor-mention';
import { polyfill } from 'react-lifecycles-compat';
import classNames from 'classnames';
import Icon from '../icon';
import warning from '../_util/warning';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
class Mention extends React.Component {
  static getMentions = getMentions;
  static defaultProps = {
    notFoundContent: 'No matches found',
    loading: false,
    multiLines: false,
    placement: 'bottom',
  };
  static Nav = Nav;
  static toString = toString;
  static toContentState = toEditorState;
  constructor(props) {
    super(props);
    this.state = {
      filteredSuggestions: props.defaultSuggestions,
      focus: false,
    };
    warning(
      false,
      'Mention',
      'Mention component is deprecated. Please use Mentions component instead.',
    );
  }
  mentionRef = ele => {
    this.mentionEle = ele;
  };
  onSearchChange = (value, prefix) => {
    if (this.props.onSearchChange) {
      return this.props.onSearchChange(value, prefix);
    }
    return this.defaultSearchChange(value);
  };
  onChange = editorState => {
    if (this.props.onChange) {
      this.props.onChange(editorState);
    }
  };
  onFocus = ev => {
    this.setState({
      focus: true,
    });
    if (this.props.onFocus) {
      this.props.onFocus(ev);
    }
  };
  onBlur = ev => {
    this.setState({
      focus: false,
    });
    if (this.props.onBlur) {
      this.props.onBlur(ev);
    }
  };
  focus = () => {
    this.mentionEle._editor.focusEditor();
  };
  defaultSearchChange(value) {
    const searchValue = value.toLowerCase();
    const filteredSuggestions = (this.props.defaultSuggestions || []).filter(suggestion => {
      if (typeof suggestion === 'string') {
        return suggestion.toLowerCase().indexOf(searchValue) !== -1;
      }
      if (suggestion.type && suggestion.type === Nav) {
        return suggestion.props.value
          ? suggestion.props.value.toLowerCase().indexOf(searchValue) !== -1
          : true;
      }
      return false;
    });
    this.setState({
      filteredSuggestions,
    });
  }
  renderMention = ({ getPrefixCls }) => {
    const {
      prefixCls: customizePrefixCls,
      className = '',
      loading,
      placement,
      suggestions,
    } = this.props;
    const { filteredSuggestions, focus } = this.state;
    const prefixCls = getPrefixCls('mention', customizePrefixCls);
    const cls = classNames(className, {
      [`${prefixCls}-active`]: focus,
      [`${prefixCls}-placement-top`]: placement === 'top',
    });
    const notFoundContent = loading ? <Icon type="loading" /> : this.props.notFoundContent;
    return (
      <RcMention
        {...this.props}
        prefixCls={prefixCls}
        className={cls}
        ref={this.mentionRef}
        onSearchChange={this.onSearchChange}
        onChange={this.onChange}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        suggestions={suggestions || filteredSuggestions}
        notFoundContent={notFoundContent}
      />
    );
  };
  render() {
    return <ConfigConsumer>{this.renderMention}</ConfigConsumer>;
  }
}
polyfill(Mention);
export default Mention;
