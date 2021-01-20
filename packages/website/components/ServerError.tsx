import React from 'react';
import { Result } from 'antd';

export default function ServerError(props: { style?: React.CSSProperties }): JSX.Element {
  return (
    <Result
      status={500}
      title="Server error"
      subTitle="Sorry, we had a problem when getting the information."
      style={props?.style}
    />
  );
}
