import { faBullhorn, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';
import Link from 'next/link';
import React, { useState, useEffect, useMemo, HTMLAttributes } from 'react';
import Cookie from 'universal-cookie';

import styles from './DonateAlert.module.scss';

export default function DonateAlert(props: HTMLAttributes<HTMLElement>): JSX.Element {
  const cookie: Cookie = useMemo(() => new Cookie(), []);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(cookie.get('dismissed') == 1);
  }, [cookie]);

  return (
    !hidden && (
      <div {...props} className={classnames(styles.donate, props.className)}>
        <Link href="/authorization" as="/authorization" passHref>
          <a>
            <FontAwesomeIcon icon={faBullhorn} className={styles.bullhorn} />
            Hey, we need your support to expand our database. Click here to donate a GitHub access
            token
          </a>
        </Link>
        <FontAwesomeIcon
          icon={faTimes}
          className={styles.close}
          onClick={() => {
            cookie.set('dismissed', 1, { maxAge: 24 * 60 * 60 });
            setHidden(true);
          }}
        />
      </div>
    )
  );
}
