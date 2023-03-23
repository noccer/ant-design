import * as React from 'react';
import * as PropTypes from 'prop-types';
import classNames from 'classnames';
import createDOMForm from 'rc-form/lib/createDOMForm';
import createFormField from 'rc-form/lib/createFormField';
import omit from 'omit.js';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import { ColProps } from '../grid/col';
import { tuple } from '../_util/type';
import warning from '../_util/warning';
import FormItem, { FormLabelAlign } from './FormItem';
import { FIELD_META_PROP, FIELD_DATA_PROP } from './constants';
import FormContext from './context';
import { FormWrappedProps } from './interface';
const FormLayouts = tuple('horizontal', 'inline', 'vertical');
export default class Form extends React.Component {
  static defaultProps = {
    colon: true,
    layout: 'horizontal',
    hideRequiredMark: false,
    onSubmit(e) {
      e.preventDefault();
    },
  };
  static propTypes = {
    prefixCls: PropTypes.string,
    layout: PropTypes.oneOf(FormLayouts),
    children: PropTypes.any,
    onSubmit: PropTypes.func,
    hideRequiredMark: PropTypes.bool,
    colon: PropTypes.bool,
  };
  static Item = FormItem;
  static createFormField = createFormField;
  static create = function create(options = {}) {
    return createDOMForm({
      fieldNameProp: 'id',
      ...options,
      fieldMetaProp: FIELD_META_PROP,
      fieldDataProp: FIELD_DATA_PROP,
    });
  };
  constructor(props) {
    super(props);
    warning(!props.form, 'Form', 'It is unnecessary to pass `form` to `Form` after antd@1.7.0.');
  }
  renderForm = ({ getPrefixCls }) => {
    const { prefixCls: customizePrefixCls, hideRequiredMark, className = '', layout } = this.props;
    const prefixCls = getPrefixCls('form', customizePrefixCls);
    const formClassName = classNames(
      prefixCls,
      {
        [`${prefixCls}-horizontal`]: layout === 'horizontal',
        [`${prefixCls}-vertical`]: layout === 'vertical',
        [`${prefixCls}-inline`]: layout === 'inline',
        [`${prefixCls}-hide-required-mark`]: hideRequiredMark,
      },
      className,
    );
    const formProps = omit(this.props, [
      'prefixCls',
      'className',
      'layout',
      'form',
      'hideRequiredMark',
      'wrapperCol',
      'labelAlign',
      'labelCol',
      'colon',
    ]);
    return <form {...formProps} className={formClassName} />;
  };
  render() {
    const { wrapperCol, labelAlign, labelCol, layout, colon } = this.props;
    return (
      <FormContext.Provider
        value={{
          wrapperCol,
          labelAlign,
          labelCol,
          vertical: layout === 'vertical',
          colon,
        }}
      >
        <ConfigConsumer>{this.renderForm}</ConfigConsumer>
      </FormContext.Provider>
    );
  }
}
