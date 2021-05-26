import React from 'react';

interface SectionDividerAttributes extends React.HTMLAttributes<HTMLElement> {
  title: string;
}

export default function SectionDivider(props: SectionDividerAttributes): JSX.Element {
  return (
    <section {...props} className={`gittrends-section-divider ${props.className ?? ''}`}>
      <span className="line" />
      <span className="title">{props.title}</span>
      <span className="line" />
    </section>
  );
}
