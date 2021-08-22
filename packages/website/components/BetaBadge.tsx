import React from 'react';

import styles from './BetaBadge.module.scss';

export default function BetaBadge(props: React.HTMLAttributes<HTMLElement>): JSX.Element {
  return (
    <span {...props} className={`${styles['beta-badge']} ${props.className ?? ''}`}>
      BETA
    </span>
  );
}
