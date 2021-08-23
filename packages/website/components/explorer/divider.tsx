import React from 'react';
import classnames from 'classnames';

import styles from './divider.module.scss';

interface SectionDividerAttributes extends React.HTMLAttributes<HTMLElement> {
  title: string;
}

export default function SectionDivider(props: SectionDividerAttributes): JSX.Element {
  return (
    <section {...props} className={classnames(props.className, styles['section-divider'])}>
      <span className={styles.line} />
      <span className={styles.title}>{props.title}</span>
      <span className={styles.line} />
    </section>
  );
}
