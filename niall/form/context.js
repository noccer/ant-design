import createReactContext from '@ant-design/create-react-context';
import { ColProps } from '../grid/col';
import { FormLabelAlign } from './FormItem';
const FormContext = createReactContext({
  labelAlign: 'right',
  vertical: false,
});
export default FormContext;
