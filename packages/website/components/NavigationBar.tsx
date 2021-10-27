/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
import { faGithub, faTwitter } from '@fortawesome/free-brands-svg-icons';
import {
  faEnvelope,
  faThLarge,
  faHome,
  faQuestionCircle,
  faGlobe,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import React, { useState } from 'react';

import BetaBadge from './BetaBadge';
import Logo from './Logo';
import styles from './NavigationBar.module.scss';
import Search from './Search';

type TMenuItem = { title: string; link: string; icon: any };
type TMenu = Array<TMenuItem>;

export default function NavigationBar(
  props: { showSearch: boolean } & React.HTMLAttributes<HTMLElement>
): JSX.Element {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const links: TMenu = [
    { title: 'Home', link: '/', icon: faHome },
    { title: 'Explorer', link: '/explorer', icon: faThLarge },
    { title: 'Demography', link: '/demography', icon: faGlobe },
    { title: 'About', link: '/about', icon: faQuestionCircle }
  ];

  function renderMenuItem(item: TMenuItem): JSX.Element {
    const active =
      item.link === '/' ? router.pathname === item.link : router.pathname.startsWith(item.link);

    return (
      <Link key={item.title} href={item.link} passHref>
        <a
          className={classnames(styles.item, { [styles.active]: active })}
          onClick={() => setShowMenu(false)}
        >
          <FontAwesomeIcon icon={item.icon} className={styles.icon} /> <span>{item.title}</span>
        </a>
      </Link>
    );
  }

  const { showSearch, ...sectionProps } = props;

  return (
    <section {...sectionProps} className={`${styles['navigation-bar']} ${props.className ?? ''}`}>
      <BetaBadge className={styles.badge} />
      <header>
        <Logo />
      </header>
      <FontAwesomeIcon
        icon={faBars}
        className={styles['menu-icon']}
        onClick={() => setShowMenu(true)}
      />
      <section className={classnames(styles.menu, { [styles['mobile-menu']]: showMenu })}>
        <FontAwesomeIcon
          icon={faTimes}
          className={styles['close-menu-icon']}
          onClick={() => setShowMenu(false)}
        />
        {showSearch ? (
          <div className={`${styles.item} ${styles['search-area']}`}>
            <Search
              placeholder="Search"
              onSearch={(query) => Router.push({ pathname: '/explorer', query: { query } })}
              onSelectOption={(option) => Router.push({ pathname: `/explorer/${option}` })}
            />
          </div>
        ) : (
          <></>
        )}

        {links.map((item) => renderMenuItem(item))}
      </section>
      <footer>
        <a
          href="https://github.com/hsborges"
          className={styles.icon}
          target="_blank"
          rel="noreferrer"
        >
          <FontAwesomeIcon icon={faGithub} />
        </a>
        <a
          href="https://twitter.com/hudsonsilbor"
          className={styles.icon}
          target="_blank"
          rel="noreferrer"
        >
          <FontAwesomeIcon icon={faTwitter} />
        </a>
        <a
          href="mailTo:hudsonsilbor@gmail.com"
          className={styles.icon}
          target="_blank"
          rel="noreferrer"
        >
          <FontAwesomeIcon icon={faEnvelope} />
        </a>
      </footer>
    </section>
  );
}
