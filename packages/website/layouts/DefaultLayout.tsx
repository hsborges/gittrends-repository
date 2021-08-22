import React from 'react';
import Head from 'next/head';
import classnames from 'classnames';
import NavigationBar from '../components/NavigationBar';
import MadeWithLove from '../components/MadeWithLove';
import DonateAlert from '../components/DonateAlert';

import styles from './DefaultLayout.module.scss';

export default function DefaultLayout(
  props: { showSearch?: boolean } & React.HTMLAttributes<HTMLElement>
): JSX.Element {
  const { showSearch, ...sectionProps } = props;

  return (
    <section className={styles['default-layout']}>
      <Head>
        <title>GitTrends.app - Monitoring Popular GitHub Projects</title>
      </Head>
      <NavigationBar showSearch={showSearch ?? false} />
      <section className={styles['main-container']}>
        <DonateAlert />
        <div
          {...sectionProps}
          className={classnames(sectionProps.className, styles['main-container-content'])}
        >
          {props.children}
        </div>
        <MadeWithLove className={styles['main-container-footer']} />
      </section>
    </section>
  );
}
