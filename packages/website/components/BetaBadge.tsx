import React from 'react';

export default function BetaBadge(props: React.HTMLAttributes<HTMLElement>): JSX.Element {
  return (
    <span {...props} className={`gittrends-beta-badge ${props.className}`}>
      BETA
    </span>
  );
}
