import React from 'react';

import UnderConstruction from '../../components/UnderConstruction';
import Layout from '../../layouts/DefaultLayout';

export default class Topics extends React.Component {
  render(): JSX.Element {
    return (
      <Layout>
        <UnderConstruction percent={40} />
      </Layout>
    );
  }
}
