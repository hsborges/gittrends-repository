import React, { useState, useEffect, useMemo } from 'react';
import Cookie from 'universal-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn, faTimes } from '@fortawesome/free-solid-svg-icons';

import './DonateAlert.module.less';

export default function DonateAlert(): JSX.Element {
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
    <div className="donate" style={{ display: hidden ? 'none' : 'flex' }}>
      <FontAwesomeIcon icon={faBullhorn} className="icon" />
      <span>
        Hey, we need your support to expand our database. Click here to donate a GitHub access token
      </span>
      <FontAwesomeIcon icon={faTimes} className="close" onClick={close} />
    </div>
  );
}
