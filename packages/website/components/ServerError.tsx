import React from 'react';
import { Result } from 'antd';

export default function ServerError(props: React.HTMLAttributes<HTMLElement>): JSX.Element {
  return (
    <Result
      status={500}
      title="Server error"
      subTitle="Sorry, we had a problem when getting the information."
      {...props}
    />
  );
}
