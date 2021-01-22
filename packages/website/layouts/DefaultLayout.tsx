import React from 'react';
import NavigationBar from '../components/NavigationBar';

interface DefaultLayoutAttributes extends React.HTMLProps<HTMLElement> {
  showSearch?: boolean;
}

export default function DefaultLayout(props: DefaultLayoutAttributes): JSX.Element {
  const sectionProps = { ...props, showSearch: undefined };

  return (
    <section className="default-layout">
      <NavigationBar showSearch={props.showSearch ?? false} className="navigation-bar" />
      <section {...sectionProps} className={`main-container ${props.className ?? ''}`}>
        {props.children}
      </section>
    </section>
  );
}
