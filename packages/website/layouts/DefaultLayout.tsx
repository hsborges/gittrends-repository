import React from 'react';
import NavigationBar from '../components/NavigationBar';

export default function DefaultLayout(props: React.HTMLProps<HTMLElement>): JSX.Element {
  return (
    <section className="default-layout">
      <NavigationBar className="navigation-bar" />
      <section {...props} className={`main-container ${props.className ?? ''}`}>
        {props.children}
      </section>
    </section>
  );
}
