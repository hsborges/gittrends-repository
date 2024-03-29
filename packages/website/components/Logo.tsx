import classnames from 'classnames';
import Link from 'next/link';
import React from 'react';

import styles from './Logo.module.scss';

export default function Logo(props: React.HTMLAttributes<HTMLElement>): JSX.Element {
  return (
    <Link href="/" passHref>
      <a {...props} className={classnames(styles.logo, props.className)}>
        <img src="/images/logo-white.png" alt="GitTrends.app" />
        <span>GitTrends</span>
      </a>
    </Link>
  );
}
