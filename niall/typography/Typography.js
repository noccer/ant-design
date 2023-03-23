import * as React from 'react';
import classNames from 'classnames';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import warning from '../_util/warning';
import { composeRef } from '../_util/ref';
const Typography = (
  {
    prefixCls: customizePrefixCls,
    component = 'article',
    className,
    'aria-label': ariaLabel,
    setContentRef,
    children,
    ...restProps
  },
  ref,
) => {
  let mergedRef = ref;
  if (setContentRef) {
    warning(false, 'Typography', '`setContentRef` is deprecated. Please use `ref` instead.');
    mergedRef = composeRef(ref, setContentRef);
  }
  return (
    <ConfigConsumer>
      {({ getPrefixCls }) => {
        const Component = component;
        const prefixCls = getPrefixCls('typography', customizePrefixCls);
        return (
          <Component
            className={classNames(prefixCls, className)}
            aria-label={ariaLabel}
            ref={mergedRef}
            {...restProps}
          >
            {children}
          </Component>
        );
      }}
    </ConfigConsumer>
  );
};
let RefTypography;
if (React.forwardRef) {
  RefTypography = React.forwardRef(Typography);
  RefTypography.displayName = 'Typography';
} else {
  class TypographyWrapper extends React.Component {
    state = {};
    render() {
      return <Typography {...this.props} />;
    }
  }
  RefTypography = TypographyWrapper;
}

// es default export should use const instead of let
const ExportTypography = RefTypography;
export default ExportTypography;
