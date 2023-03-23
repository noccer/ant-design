import * as React from 'react';
import Button from '../button';
const Operation = ({
  disabled,
  moveToLeft,
  moveToRight,
  leftArrowText = '',
  rightArrowText = '',
  leftActive,
  rightActive,
  className,
  style,
}) => (
  <div className={className} style={style}>
    <Button
      type="primary"
      size="small"
      disabled={disabled || !rightActive}
      onClick={moveToRight}
      icon="right"
    >
      {rightArrowText}
    </Button>
    <Button
      type="primary"
      size="small"
      disabled={disabled || !leftActive}
      onClick={moveToLeft}
      icon="left"
    >
      {leftArrowText}
    </Button>
  </div>
);
export default Operation;
