import * as React from 'react';
import classnames from 'classnames';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import Icon from '../icon';
import Tag from '../tag';
import Breadcrumb, { BreadcrumbProps } from '../breadcrumb';
import Avatar, { AvatarProps } from '../avatar';
import TransButton from '../_util/transButton';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
const renderBack = (prefixCls, backIcon, onBack) => {
  if (!backIcon || !onBack) {
    return null;
  }
  return (
    <LocaleReceiver componentName="PageHeader">
      {({ back }) => (
        <div className={`${prefixCls}-back`}>
          <TransButton
            onClick={e => {
              if (onBack) {
                onBack(e);
              }
            }}
            className={`${prefixCls}-back-button`}
            aria-label={back}
          >
            {backIcon}
          </TransButton>
        </div>
      )}
    </LocaleReceiver>
  );
};
const renderBreadcrumb = breadcrumb => {
  return <Breadcrumb {...breadcrumb} />;
};
const renderTitle = (prefixCls, props) => {
  const { title, avatar, subTitle, tags, extra, backIcon, onBack } = props;
  const headingPrefixCls = `${prefixCls}-heading`;
  if (title || subTitle || tags || extra) {
    const backIconDom = renderBack(prefixCls, backIcon, onBack);
    return (
      <div className={headingPrefixCls}>
        {backIconDom}
        {avatar && <Avatar {...avatar} />}
        {title && <span className={`${headingPrefixCls}-title`}>{title}</span>}
        {subTitle && <span className={`${headingPrefixCls}-sub-title`}>{subTitle}</span>}
        {tags && <span className={`${headingPrefixCls}-tags`}>{tags}</span>}
        {extra && <span className={`${headingPrefixCls}-extra`}>{extra}</span>}
      </div>
    );
  }
  return null;
};
const renderFooter = (prefixCls, footer) => {
  if (footer) {
    return <div className={`${prefixCls}-footer`}>{footer}</div>;
  }
  return null;
};
const renderChildren = (prefixCls, children) => {
  return <div className={`${prefixCls}-content`}>{children}</div>;
};
const PageHeader = props => (
  <ConfigConsumer>
    {({ getPrefixCls, pageHeader }) => {
      const {
        prefixCls: customizePrefixCls,
        style,
        footer,
        children,
        breadcrumb,
        className: customizeClassName,
      } = props;
      let ghost = true;

      // Use `ghost` from `props` or from `ConfigProvider` instead.
      if ('ghost' in props) {
        ghost = props.ghost;
      } else if (pageHeader && 'ghost' in pageHeader) {
        ghost = pageHeader.ghost;
      }
      const prefixCls = getPrefixCls('page-header', customizePrefixCls);
      const breadcrumbDom = breadcrumb && breadcrumb.routes ? renderBreadcrumb(breadcrumb) : null;
      const className = classnames(prefixCls, customizeClassName, {
        'has-breadcrumb': breadcrumbDom,
        'has-footer': footer,
        [`${prefixCls}-ghost`]: ghost,
      });
      return (
        <div className={className} style={style}>
          {breadcrumbDom}
          {renderTitle(prefixCls, props)}
          {children && renderChildren(prefixCls, children)}
          {renderFooter(prefixCls, footer)}
        </div>
      );
    }}
  </ConfigConsumer>
);
PageHeader.defaultProps = {
  backIcon: <Icon type="arrow-left" />,
};
export default PageHeader;
