import React, { useState, useEffect, useMemo, HTMLAttributes } from 'react';
import Cookie from 'universal-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function DonateAlert(props: HTMLAttributes<HTMLElement>): JSX.Element {
  const cookie: Cookie = useMemo(() => new Cookie(), []);
  const [hidden, setHidden] = useState(true);

  const close = () => {
    cookie.set('dismissed', true, { maxAge: 24 * 60 * 60 });
    setHidden(true);
  };

  useEffect(() => {
    setHidden(cookie.get('dismissed'));
  }, [hidden, cookie]);

  return (
    <div {...props} className={`gittrends-donate ${props.className ?? ''}`} hidden={hidden}>
      <FontAwesomeIcon icon={faBullhorn} className="icon" />
      <span>
        Hey, we need your support to expand our database. Click here to donate a GitHub access token
      </span>
      <FontAwesomeIcon icon={faTimes} className="close" onClick={close} />
    </div>
  );
}
