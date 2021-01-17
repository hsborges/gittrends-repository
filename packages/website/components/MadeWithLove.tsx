import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

import './MadeWithLove.module.less';

export default function MadeWithLove(): JSX.Element {
  return (
    <footer className="love">
      made with <FontAwesomeIcon icon={faHeart} className="heart" /> by
      <a href="https://github.com/hsborges" target="_blank" rel="noreferrer">
        hsborges
      </a>
    </footer>
  );
}
