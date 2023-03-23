import * as React from 'react';
export default class InputElement extends React.Component {
  saveRef = ele => {
    const { ref: childRef } = this.props.children;
    if (typeof childRef === 'function') {
      childRef(ele);
    }
  };
  render() {
    return React.cloneElement(
      this.props.children,
      {
        ...this.props,
        ref: this.saveRef,
      },
      null,
    );
  }
}
