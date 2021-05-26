import React, { useState, useEffect, useMemo, HTMLAttributes } from 'react';
import Link from 'next/link';
import Cookie from 'universal-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function DonateAlert(props: HTMLAttributes<HTMLElement>): JSX.Element {
  const cookie: Cookie = useMemo(() => new Cookie(), []);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(cookie.get('dismissed') == 1);
  }, [hidden, cookie]);

  return (
    <div {...props} className={`gittrends-donate ${props.className ?? ''}`} hidden={hidden}>
      <Link href="/authorization" as="/authorization" passHref>
        <a>
          <FontAwesomeIcon icon={faBullhorn} className="bullhorn" />
          Hey, we need your support to expand our database. Click here to donate a GitHub access
          token
        </a>
      </Link>
      <FontAwesomeIcon
        icon={faTimes}
        className="close"
        onClick={() => {
          cookie.set('dismissed', 1, { maxAge: 24 * 60 * 60 });
          setHidden(true);
        }}
      />
    </div>
  );
}
