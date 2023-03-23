/* tslint:disable */
/* eslint-disable */
import * as React from 'react';
import Form, { FormComponentProps, FormCreateOption } from '../Form';
describe('Form TypeScript test', async () => {
  it('empty test case placeholder to avoid jest error', () => {
    // empty
  });
});

// test Form.create on component without own props
class WithoutOwnProps extends React.Component {
  state = {
    foo: 'bar',
  };
  render() {
    return <div>foo</div>;
  }
}
const WithoutOwnPropsForm = Form.create()(WithoutOwnProps);
<WithoutOwnPropsForm />;

// test Form.create on component with own props

class WithOwnProps extends React.Component {
  state = {
    foo: 'bar',
  };
  render() {
    return <div>foo</div>;
  }
}
const WithOwnPropsForm = Form.create()(WithOwnProps);
<WithOwnPropsForm name="foo" />;

// test Form.create with options

class WithCreateOptions extends React.Component {
  render() {
    return <div>foo</div>;
  }
}
const mapPropsToFields = props => {
  const { username } = props;
  return {
    username: Form.createFormField({
      value: username,
    }),
  };
};
const formOptions = {
  mapPropsToFields,
};
const WithCreateOptionsForm = Form.create(formOptions)(WithCreateOptions);
<WithCreateOptionsForm username="foo" />;

// Should work with forwardRef & wrappedComponentRef
// https://github.com/ant-design/ant-design/issues/16229
if (React.forwardRef) {
  const ForwardDemo = React.forwardRef(({ str }, ref) => {
    return <div ref={ref}>{str || ''}</div>;
  });
  const WrappedForwardDemo = Form.create()(ForwardDemo);
  <WrappedForwardDemo str="" />;
}
class WrapRefDemo extends React.Component {
  getForm() {
    return this.props.form;
  }
  render() {
    return <div>{this.props.str || ''}</div>;
  }
}
const WrappedWrapRefDemo = Form.create()(WrapRefDemo);
<WrappedWrapRefDemo str="" wrappedComponentRef={() => null} />;
