import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as PropTypes from 'prop-types';
import classNames from 'classnames';
import addEventListener from 'rc-util/lib/Dom/addEventListener';
import Affix from '../affix';
import AnchorLink from './AnchorLink';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import scrollTo from '../_util/scrollTo';
import getScroll from '../_util/getScroll';
function getDefaultContainer() {
  return window;
}
function getOffsetTop(element, container) {
  if (!element) {
    return 0;
  }
  if (!element.getClientRects().length) {
    return 0;
  }
  const rect = element.getBoundingClientRect();
  if (rect.width || rect.height) {
    if (container === window) {
      container = element.ownerDocument.documentElement;
      return rect.top - container.clientTop;
    }
    return rect.top - container.getBoundingClientRect().top;
  }
  return rect.top;
}
const sharpMatcherRegx = /#([^#]+)$/;
export default class Anchor extends React.Component {
  static defaultProps = {
    affix: true,
    showInkInFixed: false,
    getContainer: getDefaultContainer,
  };
  static childContextTypes = {
    antAnchor: PropTypes.object,
  };
  state = {
    activeLink: null,
  };
  links = [];
  getChildContext() {
    const antAnchor = {
      registerLink: link => {
        if (!this.links.includes(link)) {
          this.links.push(link);
        }
      },
      unregisterLink: link => {
        const index = this.links.indexOf(link);
        if (index !== -1) {
          this.links.splice(index, 1);
        }
      },
      activeLink: this.state.activeLink,
      scrollTo: this.handleScrollTo,
      onClick: this.props.onClick,
    };
    return {
      antAnchor,
    };
  }
  componentDidMount() {
    const { getContainer } = this.props;
    this.scrollContainer = getContainer();
    this.scrollEvent = addEventListener(this.scrollContainer, 'scroll', this.handleScroll);
    this.handleScroll();
  }
  componentDidUpdate() {
    if (this.scrollEvent) {
      const { getContainer } = this.props;
      const currentContainer = getContainer();
      if (this.scrollContainer !== currentContainer) {
        this.scrollContainer = currentContainer;
        this.scrollEvent.remove();
        this.scrollEvent = addEventListener(this.scrollContainer, 'scroll', this.handleScroll);
        this.handleScroll();
      }
    }
    this.updateInk();
  }
  componentWillUnmount() {
    if (this.scrollEvent) {
      this.scrollEvent.remove();
    }
  }
  getCurrentAnchor(offsetTop = 0, bounds = 5) {
    const { getCurrentAnchor } = this.props;
    if (typeof getCurrentAnchor === 'function') {
      return getCurrentAnchor();
    }
    const activeLink = '';
    if (typeof document === 'undefined') {
      return activeLink;
    }
    const linkSections = [];
    const { getContainer } = this.props;
    const container = getContainer();
    this.links.forEach(link => {
      const sharpLinkMatch = sharpMatcherRegx.exec(link.toString());
      if (!sharpLinkMatch) {
        return;
      }
      const target = document.getElementById(sharpLinkMatch[1]);
      if (target) {
        const top = getOffsetTop(target, container);
        if (top < offsetTop + bounds) {
          linkSections.push({
            link,
            top,
          });
        }
      }
    });
    if (linkSections.length) {
      const maxSection = linkSections.reduce((prev, curr) => (curr.top > prev.top ? curr : prev));
      return maxSection.link;
    }
    return '';
  }
  handleScrollTo = link => {
    const { offsetTop, getContainer, targetOffset } = this.props;
    this.setCurrentActiveLink(link);
    const container = getContainer();
    const scrollTop = getScroll(container, true);
    const sharpLinkMatch = sharpMatcherRegx.exec(link);
    if (!sharpLinkMatch) {
      return;
    }
    const targetElement = document.getElementById(sharpLinkMatch[1]);
    if (!targetElement) {
      return;
    }
    const eleOffsetTop = getOffsetTop(targetElement, container);
    let y = scrollTop + eleOffsetTop;
    y -= targetOffset !== undefined ? targetOffset : offsetTop || 0;
    this.animating = true;
    scrollTo(y, {
      callback: () => {
        this.animating = false;
      },
      getContainer,
    });
  };
  saveInkNode = node => {
    this.inkNode = node;
  };
  setCurrentActiveLink = link => {
    const { activeLink } = this.state;
    const { onChange } = this.props;
    if (activeLink !== link) {
      this.setState({
        activeLink: link,
      });
      if (onChange) {
        onChange(link);
      }
    }
  };
  handleScroll = () => {
    if (this.animating) {
      return;
    }
    const { offsetTop, bounds, targetOffset } = this.props;
    const currentActiveLink = this.getCurrentAnchor(
      targetOffset !== undefined ? targetOffset : offsetTop || 0,
      bounds,
    );
    this.setCurrentActiveLink(currentActiveLink);
  };
  updateInk = () => {
    if (typeof document === 'undefined') {
      return;
    }
    const { prefixCls } = this;
    const anchorNode = ReactDOM.findDOMNode(this);
    const linkNode = anchorNode.getElementsByClassName(`${prefixCls}-link-title-active`)[0];
    if (linkNode) {
      this.inkNode.style.top = `${linkNode.offsetTop + linkNode.clientHeight / 2 - 4.5}px`;
    }
  };
  renderAnchor = ({ getPrefixCls }) => {
    const {
      prefixCls: customizePrefixCls,
      className = '',
      style,
      offsetTop,
      affix,
      showInkInFixed,
      children,
      getContainer,
    } = this.props;
    const { activeLink } = this.state;
    const prefixCls = getPrefixCls('anchor', customizePrefixCls);

    // To support old version react.
    // Have to add prefixCls on the instance.
    // https://github.com/facebook/react/issues/12397
    this.prefixCls = prefixCls;
    const inkClass = classNames(`${prefixCls}-ink-ball`, {
      visible: activeLink,
    });
    const wrapperClass = classNames(className, `${prefixCls}-wrapper`);
    const anchorClass = classNames(prefixCls, {
      fixed: !affix && !showInkInFixed,
    });
    const wrapperStyle = {
      maxHeight: offsetTop ? `calc(100vh - ${offsetTop}px)` : '100vh',
      ...style,
    };
    const anchorContent = (
      <div className={wrapperClass} style={wrapperStyle}>
        <div className={anchorClass}>
          <div className={`${prefixCls}-ink`}>
            <span className={inkClass} ref={this.saveInkNode} />
          </div>
          {children}
        </div>
      </div>
    );
    return !affix ? (
      anchorContent
    ) : (
      <Affix offsetTop={offsetTop} target={getContainer}>
        {anchorContent}
      </Affix>
    );
  };
  render() {
    return <ConfigConsumer>{this.renderAnchor}</ConfigConsumer>;
  }
}