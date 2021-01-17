import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faThLarge, faHome, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faTwitter } from '@fortawesome/free-brands-svg-icons';

import Logo from './Logo';
import BetaBadge from '../components/BetaBadge';

import './NavigationBar.module.less';

type TMenuItem = { title: string; link: string; icon: any };
type TMenu = Array<TMenuItem>;

export default function NavigationBar(): JSX.Element {
  const router = useRouter();

  const links: TMenu = [
    { title: 'Home', link: '/', icon: faHome },
    { title: 'Explorer', link: '/explorer', icon: faThLarge },
    { title: 'About', link: '/about', icon: faQuestionCircle }
  ];

  function renderMenuItem(item: TMenuItem): JSX.Element {
    return (
      <Link key={item.title} href={item.link} passHref>
        <a className={`item ${router.pathname === item.link ? 'active' : ''}`}>
          <FontAwesomeIcon icon={item.icon} className="icon" /> {item.title}
        </a>
      </Link>
    );
  }

  return (
    <section className="navigation-bar">
      <BetaBadge />
      <header>
        <Logo />
      </header>
      <section className="menu">{links.map((item) => renderMenuItem(item))}</section>
      <footer>
        <a href="https://github.com/hsborges" className="icon" target="_blank" rel="noreferrer">
          <FontAwesomeIcon icon={faGithub} />
        </a>
        <a
          href="https://twitter.com/hudsonsilbor"
          className="icon"
          target="_blank"
          rel="noreferrer"
        >
          <FontAwesomeIcon icon={faTwitter} />
        </a>
        <a href="mailTo:hudsonsilbor@gmail.com" className="icon" target="_blank" rel="noreferrer">
          <FontAwesomeIcon icon={faEnvelope} />
        </a>
      </footer>
    </section>
  );
}
