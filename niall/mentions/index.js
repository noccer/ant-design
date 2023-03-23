import classNames from 'classnames';
import omit from 'omit.js';
import * as React from 'react';
import { polyfill } from 'react-lifecycles-compat';
import RcMentions from 'rc-mentions';
import { MentionsProps as RcMentionsProps } from 'rc-mentions/lib/Mentions';
import Spin from '../spin';
import { ConfigConsumer, ConfigConsumerProps, RenderEmptyHandler } from '../config-provider';
const { Option } = RcMentions;
function loadingFilterOption() {
  return true;
}
class Mentions extends React.Component {
  static Option = Option;
  static getMentions = (value = '', config) => {
    const { prefix = '@', split = ' ' } = config || {};
    const prefixList = Array.isArray(prefix) ? prefix : [prefix];
    return value
      .split(split)
      .map((str = '') => {
        let hitPrefix = null;
        prefixList.some(prefixStr => {
          const startStr = str.slice(0, prefixStr.length);
          if (startStr === prefixStr) {
            hitPrefix = prefixStr;
            return true;
          }
          return false;
        });
        if (hitPrefix !== null) {
          return {
            prefix: hitPrefix,
            value: str.slice(hitPrefix.length),
          };
        }
        return null;
      })
      .filter(entity => !!entity && !!entity.value);
  };
  state = {
    focused: false,
  };
  onFocus = (...args) => {
    const { onFocus } = this.props;
    if (onFocus) {
      onFocus(...args);
    }
    this.setState({
      focused: true,
    });
  };
  onBlur = (...args) => {
    const { onBlur } = this.props;
    if (onBlur) {
      onBlur(...args);
    }
    this.setState({
      focused: false,
    });
  };
  getNotFoundContent(renderEmpty) {
    const { notFoundContent } = this.props;
    if (notFoundContent !== undefined) {
      return notFoundContent;
    }
    return renderEmpty('Select');
  }
  getOptions = () => {
    const { children, loading } = this.props;
    if (loading) {
      return (
        <Option value="ANTD_SEARCHING" disabled>
          <Spin size="small" />
        </Option>
      );
    }
    return children;
  };
  getFilterOption = () => {
    const { filterOption, loading } = this.props;
    if (loading) {
      return loadingFilterOption;
    }
    return filterOption;
  };
  saveMentions = node => {
    this.rcMentions = node;
  };
  focus() {
    this.rcMentions.focus();
  }
  blur() {
    this.rcMentions.blur();
  }
  renderMentions = ({ getPrefixCls, renderEmpty }) => {
    const { focused } = this.state;
    const { prefixCls: customizePrefixCls, className, disabled, ...restProps } = this.props;
    const prefixCls = getPrefixCls('mentions', customizePrefixCls);
    const mentionsProps = omit(restProps, ['loading']);
    const mergedClassName = classNames(className, {
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-focused`]: focused,
    });
    return (
      <RcMentions
        prefixCls={prefixCls}
        notFoundContent={this.getNotFoundContent(renderEmpty)}
        className={mergedClassName}
        disabled={disabled}
        {...mentionsProps}
        filterOption={this.getFilterOption()}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        ref={this.saveMentions}
      >
        {this.getOptions()}
      </RcMentions>
    );
  };
  render() {
    return <ConfigConsumer>{this.renderMentions}</ConfigConsumer>;
  }
}
polyfill(Mentions);
export default Mentions;
