import * as React from 'react';
import classNames from 'classnames';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import DefaultEmptyImg from './empty';
import SimpleEmptyImg from './simple';
const defaultEmptyImg = <DefaultEmptyImg />;
const simpleEmptyImg = <SimpleEmptyImg />;
const Empty = props => (
  <ConfigConsumer>
    {({ getPrefixCls }) => {
      const {
        className,
        prefixCls: customizePrefixCls,
        image = defaultEmptyImg,
        description,
        children,
        imageStyle,
        ...restProps
      } = props;
      return (
        <LocaleReceiver componentName="Empty">
          {locale => {
            const prefixCls = getPrefixCls('empty', customizePrefixCls);
            const des = typeof description !== 'undefined' ? description : locale.description;
            const alt = typeof des === 'string' ? des : 'empty';
            let imageNode = null;
            if (typeof image === 'string') {
              imageNode = <img alt={alt} src={image} />;
            } else {
              imageNode = image;
            }
            return (
              <div
                className={classNames(
                  prefixCls,
                  {
                    [`${prefixCls}-normal`]: image === simpleEmptyImg,
                  },
                  className,
                )}
                {...restProps}
              >
                <div className={`${prefixCls}-image`} style={imageStyle}>
                  {imageNode}
                </div>
                {des && <p className={`${prefixCls}-description`}>{des}</p>}
                {children && <div className={`${prefixCls}-footer`}>{children}</div>}
              </div>
            );
          }}
        </LocaleReceiver>
      );
    }}
  </ConfigConsumer>
);
Empty.PRESENTED_IMAGE_DEFAULT = defaultEmptyImg;
Empty.PRESENTED_IMAGE_SIMPLE = simpleEmptyImg;
export default Empty;
