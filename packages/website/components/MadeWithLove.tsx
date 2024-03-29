import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';
import React from 'react';

import styles from './MadeWithLove.module.scss';

export default function MadeWithLove(props: React.HTMLAttributes<HTMLElement>): JSX.Element {
  return (
    <footer {...props} className={classnames(styles.love, props.className)}>
      <span>
        made with <FontAwesomeIcon icon={faHeart} className={styles.heart} /> by
        <a href="https://github.com/hsborges" target="_blank" rel="noreferrer">
          hsborges
        </a>
      </span>
    </footer>
  );
}
