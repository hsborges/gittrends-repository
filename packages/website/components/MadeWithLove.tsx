import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

import styles from './MadeWithLove.module.scss';

export default function MadeWithLove(props: React.HTMLAttributes<HTMLElement>): JSX.Element {
  return (
    <footer {...props} className={`${styles['gittrends-love']} ${props.className ?? ''}`}>
      <span>
        made with <FontAwesomeIcon icon={faHeart} className="heart" /> by
        <a href="https://github.com/hsborges" target="_blank" rel="noreferrer">
          hsborges
        </a>
      </span>
    </footer>
  );
}
