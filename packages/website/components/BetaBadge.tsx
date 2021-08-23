import React from 'react';
import classnames from 'classnames';

import styles from './BetaBadge.module.scss';

export default function BetaBadge(props: React.HTMLAttributes<HTMLElement>): JSX.Element {
  return (
    <span {...props} className={classnames(styles.badge, props.className)}>
      BETA
    </span>
  );
}
