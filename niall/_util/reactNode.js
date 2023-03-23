import * as React from 'react';

// eslint-disable-next-line import/prefer-default-export
export function cloneElement(element, ...restArgs) {
  if (!React.isValidElement(element)) return element;
  return React.cloneElement(element, ...restArgs);
}
