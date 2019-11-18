import React from 'react';
import SEO from '@antv/gatsby-theme-antv/site/components/Seo';
import { useTranslation } from 'react-i18next';

const IndexPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <SEO title="蚂蚁数据可视化" lang="zh" />
    </>
  );
};

export default IndexPage;
