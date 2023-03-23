import * as React from 'react';
import classNames from 'classnames';
import Avatar, { SkeletonAvatarProps } from './Avatar';
import Title, { SkeletonTitleProps } from './Title';
import Paragraph, { SkeletonParagraphProps } from './Paragraph';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
function getComponentProps(prop) {
  if (prop && typeof prop === 'object') {
    return prop;
  }
  return {};
}
function getAvatarBasicProps(hasTitle, hasParagraph) {
  if (hasTitle && !hasParagraph) {
    return {
      shape: 'square',
    };
  }
  return {
    shape: 'circle',
  };
}
function getTitleBasicProps(hasAvatar, hasParagraph) {
  if (!hasAvatar && hasParagraph) {
    return {
      width: '38%',
    };
  }
  if (hasAvatar && hasParagraph) {
    return {
      width: '50%',
    };
  }
  return {};
}
function getParagraphBasicProps(hasAvatar, hasTitle) {
  const basicProps = {};

  // Width
  if (!hasAvatar || !hasTitle) {
    basicProps.width = '61%';
  }

  // Rows
  if (!hasAvatar && hasTitle) {
    basicProps.rows = 3;
  } else {
    basicProps.rows = 2;
  }
  return basicProps;
}
class Skeleton extends React.Component {
  static defaultProps = {
    avatar: false,
    title: true,
    paragraph: true,
  };
  renderSkeleton = ({ getPrefixCls }) => {
    const {
      prefixCls: customizePrefixCls,
      loading,
      className,
      children,
      avatar,
      title,
      paragraph,
      active,
    } = this.props;
    const prefixCls = getPrefixCls('skeleton', customizePrefixCls);
    if (loading || !('loading' in this.props)) {
      const hasAvatar = !!avatar;
      const hasTitle = !!title;
      const hasParagraph = !!paragraph;

      // Avatar
      let avatarNode;
      if (hasAvatar) {
        const avatarProps = {
          prefixCls: `${prefixCls}-avatar`,
          ...getAvatarBasicProps(hasTitle, hasParagraph),
          ...getComponentProps(avatar),
        };
        avatarNode = (
          <div className={`${prefixCls}-header`}>
            <Avatar {...avatarProps} />
          </div>
        );
      }
      let contentNode;
      if (hasTitle || hasParagraph) {
        // Title
        let $title;
        if (hasTitle) {
          const titleProps = {
            prefixCls: `${prefixCls}-title`,
            ...getTitleBasicProps(hasAvatar, hasParagraph),
            ...getComponentProps(title),
          };
          $title = <Title {...titleProps} />;
        }

        // Paragraph
        let paragraphNode;
        if (hasParagraph) {
          const paragraphProps = {
            prefixCls: `${prefixCls}-paragraph`,
            ...getParagraphBasicProps(hasAvatar, hasTitle),
            ...getComponentProps(paragraph),
          };
          paragraphNode = <Paragraph {...paragraphProps} />;
        }
        contentNode = (
          <div className={`${prefixCls}-content`}>
            {$title}
            {paragraphNode}
          </div>
        );
      }
      const cls = classNames(prefixCls, className, {
        [`${prefixCls}-with-avatar`]: hasAvatar,
        [`${prefixCls}-active`]: active,
      });
      return (
        <div className={cls}>
          {avatarNode}
          {contentNode}
        </div>
      );
    }
    return children;
  };
  render() {
    return <ConfigConsumer>{this.renderSkeleton}</ConfigConsumer>;
  }
}
export default Skeleton;
