import React from 'react';

import './Logo.module.less';

export default function Logo(): JSX.Element {
  return (
    <section className="logo">
      <img src="/images/logo-white.png" alt="GitTrends.app" />
      <span>GitTrends</span>
    </section>
  );
}
