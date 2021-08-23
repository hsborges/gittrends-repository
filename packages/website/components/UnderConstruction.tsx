import React from 'react';
import classnames from 'classnames';
import { CircularProgress, CircularProgressLabel } from '@chakra-ui/react';

import styles from './UnderConstruction.module.scss';

interface UnderConstructionAttributes extends React.HTMLAttributes<HTMLElement> {
  percent?: number;
}

export default function Topics(props: UnderConstructionAttributes): JSX.Element {
  return (
    <section className={classnames(styles['under-construction'], props.className)}>
      <CircularProgress
        value={props.percent}
        color="var(--primary-color)"
        size="140px"
        thickness={12}
      >
        <CircularProgressLabel>{props.percent}</CircularProgressLabel>
      </CircularProgress>
      <div className={styles.text}>Page Under Construction</div>
    </section>
  );
}
