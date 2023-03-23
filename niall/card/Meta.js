import * as React from 'react';
import classNames from 'classnames';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
const Meta = props => (
  <ConfigConsumer>
    {({ getPrefixCls }) => {
      const {
        prefixCls: customizePrefixCls,
        className,
        avatar,
        title,
        description,
        ...others
      } = props;
      const prefixCls = getPrefixCls('card', customizePrefixCls);
      const classString = classNames(`${prefixCls}-meta`, className);
      const avatarDom = avatar ? <div className={`${prefixCls}-meta-avatar`}>{avatar}</div> : null;
      const titleDom = title ? <div className={`${prefixCls}-meta-title`}>{title}</div> : null;
      const descriptionDom = description ? (
        <div className={`${prefixCls}-meta-description`}>{description}</div>
      ) : null;
      const MetaDetail =
        titleDom || descriptionDom ? (
          <div className={`${prefixCls}-meta-detail`}>
            {titleDom}
            {descriptionDom}
          </div>
        ) : null;
      return (
        <div {...others} className={classString}>
          {avatarDom}
          {MetaDetail}
        </div>
      );
    }}
  </ConfigConsumer>
);
export default Meta;
