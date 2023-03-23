import * as React from 'react';
import classNames from 'classnames';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
function getAction(actions) {
  if (!actions || !actions.length) {
    return null;
  }
  // eslint-disable-next-line react/no-array-index-key
  const actionList = actions.map((action, index) => <li key={`action-${index}`}>{action}</li>);
  return actionList;
}
export default class Comment extends React.Component {
  renderNested = (prefixCls, children) => {
    return <div className={classNames(`${prefixCls}-nested`)}>{children}</div>;
  };
  renderComment = ({ getPrefixCls }) => {
    const {
      actions,
      author,
      avatar,
      children,
      className,
      content,
      prefixCls: customizePrefixCls,
      style,
      datetime,
      ...otherProps
    } = this.props;
    const prefixCls = getPrefixCls('comment', customizePrefixCls);
    const avatarDom = (
      <div className={`${prefixCls}-avatar`}>
        {typeof avatar === 'string' ? <img src={avatar} alt="comment-avatar" /> : avatar}
      </div>
    );
    const actionDom =
      actions && actions.length ? (
        <ul className={`${prefixCls}-actions`}>{getAction(actions)}</ul>
      ) : null;
    const authorContent = (
      <div className={`${prefixCls}-content-author`}>
        {author && <span className={`${prefixCls}-content-author-name`}>{author}</span>}
        {datetime && <span className={`${prefixCls}-content-author-time`}>{datetime}</span>}
      </div>
    );
    const contentDom = (
      <div className={`${prefixCls}-content`}>
        {authorContent}
        <div className={`${prefixCls}-content-detail`}>{content}</div>
        {actionDom}
      </div>
    );
    const comment = (
      <div className={`${prefixCls}-inner`}>
        {avatarDom}
        {contentDom}
      </div>
    );
    return (
      <div {...otherProps} className={classNames(prefixCls, className)} style={style}>
        {comment}
        {children ? this.renderNested(prefixCls, children) : null}
      </div>
    );
  };
  render() {
    return <ConfigConsumer>{this.renderComment}</ConfigConsumer>;
  }
}
