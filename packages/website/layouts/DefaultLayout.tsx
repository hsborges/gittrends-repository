import React from 'react';
import Head from 'next/head';
import NavigationBar from '../components/NavigationBar';
import MadeWithLove from '../components/MadeWithLove';
import DonateAlert from '../components/DonateAlert';

import './DefaultLayout.module.less';

export default function DefaultLayout(
  props: { showSearch?: boolean } & React.HTMLAttributes<HTMLElement>
): JSX.Element {
  const { showSearch, ...sectionProps } = props;

  return (
    <section className="default-layout">
      <Head>
        <title>GitTrends.app - Monitoring Popular GitHub Projects</title>
      </Head>
      <NavigationBar showSearch={showSearch ?? false} className="navigation-bar" />
      <section {...sectionProps} className={`main-container ${props.className ?? ''}`}>
        <DonateAlert />
        {props.children}
        <MadeWithLove className="main-container-footer" />
      </section>
    </section>
  );
}
