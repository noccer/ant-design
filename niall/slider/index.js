import * as React from 'react';
import RcSlider from 'rc-slider/lib/Slider';
import RcRange from 'rc-slider/lib/Range';
import RcHandle from 'rc-slider/lib/Handle';
import Tooltip, { TooltipPlacement } from '../tooltip';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
export default class Slider extends React.Component {
  static defaultProps = {
    tipFormatter(value) {
      return value.toString();
    },
  };
  constructor(props) {
    super(props);
    this.state = {
      visibles: {},
    };
  }
  toggleTooltipVisible = (index, visible) => {
    this.setState(({ visibles }) => ({
      visibles: {
        ...visibles,
        [index]: visible,
      },
    }));
  };
  handleWithTooltip = ({
    tooltipPrefixCls,
    prefixCls,
    info: { value, dragging, index, ...restProps },
  }) => {
    const { tipFormatter, tooltipVisible, tooltipPlacement, getTooltipPopupContainer } = this.props;
    const { visibles } = this.state;
    const isTipFormatter = tipFormatter ? visibles[index] || dragging : false;
    const visible = tooltipVisible || (tooltipVisible === undefined && isTipFormatter);
    return (
      <Tooltip
        prefixCls={tooltipPrefixCls}
        title={tipFormatter ? tipFormatter(value) : ''}
        visible={visible}
        placement={tooltipPlacement || 'top'}
        transitionName="zoom-down"
        key={index}
        overlayClassName={`${prefixCls}-tooltip`}
        getPopupContainer={getTooltipPopupContainer || (() => document.body)}
      >
        <RcHandle
          {...restProps}
          value={value}
          onMouseEnter={() => this.toggleTooltipVisible(index, true)}
          onMouseLeave={() => this.toggleTooltipVisible(index, false)}
        />
      </Tooltip>
    );
  };
  saveSlider = node => {
    this.rcSlider = node;
  };
  focus() {
    this.rcSlider.focus();
  }
  blur() {
    this.rcSlider.blur();
  }
  renderSlider = ({ getPrefixCls }) => {
    const {
      prefixCls: customizePrefixCls,
      tooltipPrefixCls: customizeTooltipPrefixCls,
      range,
      ...restProps
    } = this.props;
    const prefixCls = getPrefixCls('slider', customizePrefixCls);
    const tooltipPrefixCls = getPrefixCls('tooltip', customizeTooltipPrefixCls);
    if (range) {
      return (
        <RcRange
          {...restProps}
          ref={this.saveSlider}
          handle={info =>
            this.handleWithTooltip({
              tooltipPrefixCls,
              prefixCls,
              info,
            })
          }
          prefixCls={prefixCls}
          tooltipPrefixCls={tooltipPrefixCls}
        />
      );
    }
    return (
      <RcSlider
        {...restProps}
        ref={this.saveSlider}
        handle={info =>
          this.handleWithTooltip({
            tooltipPrefixCls,
            prefixCls,
            info,
          })
        }
        prefixCls={prefixCls}
        tooltipPrefixCls={tooltipPrefixCls}
      />
    );
  };
  render() {
    return <ConfigConsumer>{this.renderSlider}</ConfigConsumer>;
  }
}
