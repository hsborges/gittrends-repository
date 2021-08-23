import React from 'react';

export default function ServerError(props: React.HTMLAttributes<HTMLElement>): JSX.Element {
  return <div {...props}>Sorry, we had a problem when getting the information.</div>;
}
