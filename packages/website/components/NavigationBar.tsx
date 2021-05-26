/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
import React from 'react';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faThLarge,
  faHome,
  faQuestionCircle,
  faGlobe,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { faGithub, faTwitter } from '@fortawesome/free-brands-svg-icons';

import Logo from './Logo';
import Search from './Search';
import BetaBadge from './BetaBadge';

type TMenuItem = { title: string; link: string; icon: any };
type TMenu = Array<TMenuItem>;

export default function NavigationBar(
  props: { showSearch: boolean } & React.HTMLAttributes<HTMLElement>
): JSX.Element {
  const router = useRouter();

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
          className={`item ${active ? 'active' : ''}`}
          onClick={() => document.querySelector('.menu').classList.remove('visible')}
        >
          <FontAwesomeIcon icon={item.icon} className="icon" /> <span>{item.title}</span>
        </a>
      </Link>
    );
  }

  const { showSearch, ...sectionProps } = props;

  return (
    <section {...sectionProps} className={`gittrends-navigation-bar ${props.className ?? ''}`}>
      <BetaBadge className="badge" />
      <header>
        <Logo />
      </header>
      <FontAwesomeIcon
        icon={faBars}
        className="menu-icon"
        onClick={() => document.querySelector('.menu').classList.add('visible')}
      />
      <section className="menu">
        <FontAwesomeIcon
          icon={faTimes}
          className="close-menu-icon"
          onClick={() => document.querySelector('.menu').classList.remove('visible')}
        />
        <div className="item search-area" hidden={!showSearch}>
          <Search
            placeholder="Search"
            onSearch={(query) => Router.push({ pathname: '/explorer', query: { query } })}
          />
        </div>
        {links.map((item) => renderMenuItem(item))}
      </section>
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
