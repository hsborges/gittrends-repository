import React from 'react';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faThLarge, faHome, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faTwitter, faHubspot } from '@fortawesome/free-brands-svg-icons';

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
    { title: 'Topic Graph', link: '/topics', icon: faHubspot },
    { title: 'About', link: '/about', icon: faQuestionCircle }
  ];

  function renderMenuItem(item: TMenuItem): JSX.Element {
    const active =
      item.link === '/' ? router.pathname === item.link : router.pathname.startsWith(item.link);

    return (
      <Link key={item.title} href={item.link} passHref>
        <a className={`item ${active ? 'active' : ''}`}>
          <FontAwesomeIcon icon={item.icon} className="icon" /> {item.title}
        </a>
      </Link>
    );
  }

  const { showSearch, ...sectionProps } = props;

  return (
    <section {...sectionProps} className={`gittrends-navigation-bar ${props.className ?? ''}`}>
      <BetaBadge />
      <header>
        <Logo />
      </header>
      <section className="menu">
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
