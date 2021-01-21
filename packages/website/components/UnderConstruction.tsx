import React from 'react';
import Router from 'next/router';
import { Button, Result, Progress } from 'antd';

interface UnderConstructionAttributes extends React.HTMLAttributes<HTMLElement> {
  percent?: number;
}

export default function Topics(props: UnderConstructionAttributes): JSX.Element {
  return (
    <section className="gittrends-under-construction">
      <Result
        icon={
          <Progress
            type="circle"
            percent={props.percent ?? 0}
            status="active"
            strokeColor="rgba(104, 178, 177, 0.85)"
            {...props}
          />
        }
        title="Page under construction"
        extra={
          <Button onClick={() => Router.push('/')} type="primary" size="large">
            Home
          </Button>
        }
      />
    </section>
  );
}
