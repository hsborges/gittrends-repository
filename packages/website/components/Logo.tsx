import React from 'react';
import Link from 'next/link';

import './Logo.module.less';

export default function Logo(): JSX.Element {
  return (
    <Link href="/" passHref>
      <a className="logo">
        <img src="/images/logo-white.png" alt="GitTrends.app" />
        <span>GitTrends</span>
      </a>
    </Link>
  );
}
