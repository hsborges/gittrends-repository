import React from 'react';
import NavigationBar from '../components/NavigationBar';
import MadeWithLove from '../components/MadeWithLove';

import './DefaultLayout.module.less';

export default function DefaultLayout(
  props: { showSearch?: boolean } & React.HTMLAttributes<HTMLElement>
): JSX.Element {
  const { showSearch, ...sectionProps } = props;

  return (
    <section className="default-layout">
      <NavigationBar showSearch={showSearch ?? false} className="navigation-bar" />
      <section {...sectionProps} className={`main-container ${props.className ?? ''}`}>
        {props.children}
        <MadeWithLove className="main-container-footer" />
      </section>
    </section>
  );
}
