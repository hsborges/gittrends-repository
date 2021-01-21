import React from 'react';

import NavigationBar from '../components/NavigationBar';
import MadeWithLove from '../components/MadeWithLove';

export default function DefaultLayout(props: React.HTMLProps<HTMLElement>): JSX.Element {
  return (
    <section className="default-layout">
      <NavigationBar className="navigation-bar" />
      <section className="main-container">
        <section {...props} className={`main-container-content ${props.className}`}>
          {props.children}
        </section>
        <MadeWithLove className="main-container-footer" />
      </section>
    </section>
  );
}
