import React from 'react';
import Link from 'next/link';

export default function Logo(props: React.HTMLAttributes<HTMLElement>): JSX.Element {
  return (
    <Link href="/" passHref>
      <a {...props} className={`gittrends-logo ${props.className ?? ''}`}>
        <img src="/images/logo-white.png" alt="GitTrends.app" />
        <span>GitTrends</span>
      </a>
    </Link>
  );
}
