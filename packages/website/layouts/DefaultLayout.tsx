import React from 'react';
import { Layout } from 'antd';

import NavigationBar from '../components/NavigationBar';
import MadeWithLove from '../components/MadeWithLove';

const { Sider, Content, Footer } = Layout;

import './DefaultLayout.module.less';

export default function DefaultLayout(props: { children?: React.ReactNode }): JSX.Element {
  return (
    <Layout className="defaultLayout">
      <Sider width={225} theme="light">
        <NavigationBar />
      </Sider>
      <Layout>
        <Content>{props.children}</Content>
        <Footer>
          <MadeWithLove />
        </Footer>
      </Layout>
    </Layout>
  );
}
