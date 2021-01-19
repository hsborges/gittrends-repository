import React from 'react';
import Router from 'next/router';
import { Button, Result, Progress } from 'antd';

import './UnderConstruction.module.less';

export default function Topics(props: { percent?: number }): JSX.Element {
  return (
    <section className="under-construction">
      <Result
        icon={
          <Progress
            type="circle"
            percent={props.percent ?? 0}
            status="active"
            strokeColor="rgba(104, 178, 177, 0.85)"
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
