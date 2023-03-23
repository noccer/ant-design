/* eslint-disable jsx-a11y/heading-has-content */
import * as React from 'react';
import classNames from 'classnames';
const Title = ({ prefixCls, className, width, style }) => (
  <h3
    className={classNames(prefixCls, className)}
    style={{
      width,
      ...style,
    }}
  />
);
export default Title;
