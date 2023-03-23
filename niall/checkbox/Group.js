import * as React from 'react';
import * as PropTypes from 'prop-types';
import { polyfill } from 'react-lifecycles-compat';
import classNames from 'classnames';
import shallowEqual from 'shallowequal';
import omit from 'omit.js';
import Checkbox, { CheckboxChangeEvent } from './Checkbox';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
class CheckboxGroup extends React.Component {
  static defaultProps = {
    options: [],
  };
  static propTypes = {
    defaultValue: PropTypes.array,
    value: PropTypes.array,
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func,
  };
  static childContextTypes = {
    checkboxGroup: PropTypes.any,
  };
  static getDerivedStateFromProps(nextProps) {
    if ('value' in nextProps) {
      return {
        value: nextProps.value || [],
      };
    }
    return null;
  }
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || props.defaultValue || [],
      registeredValues: [],
    };
  }
  getChildContext() {
    return {
      checkboxGroup: {
        toggleOption: this.toggleOption,
        value: this.state.value,
        disabled: this.props.disabled,
        name: this.props.name,
        // https://github.com/ant-design/ant-design/issues/16376
        registerValue: this.registerValue,
        cancelValue: this.cancelValue,
      },
    };
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
  }
  getOptions() {
    const { options } = this.props;
    // https://github.com/Microsoft/TypeScript/issues/7960
    return options.map(option => {
      if (typeof option === 'string') {
        return {
          label: option,
          value: option,
        };
      }
      return option;
    });
  }
  cancelValue = value => {
    this.setState(({ registeredValues }) => ({
      registeredValues: registeredValues.filter(val => val !== value),
    }));
  };
  registerValue = value => {
    this.setState(({ registeredValues }) => ({
      registeredValues: [...registeredValues, value],
    }));
  };
  toggleOption = option => {
    const { registeredValues } = this.state;
    const optionIndex = this.state.value.indexOf(option.value);
    const value = [...this.state.value];
    if (optionIndex === -1) {
      value.push(option.value);
    } else {
      value.splice(optionIndex, 1);
    }
    if (!('value' in this.props)) {
      this.setState({
        value,
      });
    }
    const { onChange } = this.props;
    if (onChange) {
      const options = this.getOptions();
      onChange(
        value
          .filter(val => registeredValues.indexOf(val) !== -1)
          .sort((a, b) => {
            const indexA = options.findIndex(opt => opt.value === a);
            const indexB = options.findIndex(opt => opt.value === b);
            return indexA - indexB;
          }),
      );
    }
  };
  renderGroup = ({ getPrefixCls }) => {
    const { props, state } = this;
    const { prefixCls: customizePrefixCls, className, style, options, ...restProps } = props;
    const prefixCls = getPrefixCls('checkbox', customizePrefixCls);
    const groupPrefixCls = `${prefixCls}-group`;
    const domProps = omit(restProps, ['children', 'defaultValue', 'value', 'onChange', 'disabled']);
    let { children } = props;
    if (options && options.length > 0) {
      children = this.getOptions().map(option => (
        <Checkbox
          prefixCls={prefixCls}
          key={option.value.toString()}
          disabled={'disabled' in option ? option.disabled : props.disabled}
          value={option.value}
          checked={state.value.indexOf(option.value) !== -1}
          onChange={option.onChange}
          className={`${groupPrefixCls}-item`}
        >
          {option.label}
        </Checkbox>
      ));
    }
    const classString = classNames(groupPrefixCls, className);
    return (
      <div className={classString} style={style} {...domProps}>
        {children}
      </div>
    );
  };
  render() {
    return <ConfigConsumer>{this.renderGroup}</ConfigConsumer>;
  }
}
polyfill(CheckboxGroup);
export default CheckboxGroup;
