import React from 'react';
import Link from 'next/link';
import { Result, Card, Avatar, Divider, Statistic, Row, Col } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faSpinner, faStar, faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import { XYPlot, XAxis, LineSeries } from 'react-vis';

import Search from '../components/Search';
import Layout from '../layouts/DefaultLayout';
import useSamples from '../hooks/useSamples';

import './index.module.less';

interface IProject {
  name_with_owner: string;
  name: string;
  open_graph_image_url: string;
  stargazers_count: number;
  forks_count: number;
}

function ProjectTimeseries(): JSX.Element {
  return (
    <XYPlot animation={0.5} height={100} width={200} className="plot">
      <XAxis title="stars (last month)" hideLine hideTicks top={80} position="middle" />
      <LineSeries
        curve={null}
        data={[
          { x: 0, y: Math.ceil(Math.random() * 100) },
          { x: 1, y: Math.ceil(Math.random() * 100) },
          { x: 3, y: Math.ceil(Math.random() * 100) },
          { x: 4, y: Math.ceil(Math.random() * 100) }
        ]}
        opacity={1}
        strokeStyle="solid"
        style={{}}
      />
    </XYPlot>
  );
}

function ProjectCard(data: IProject): JSX.Element {
  const url = `/explore/${data.name_with_owner}`;
  return (
    <Card className="card">
      <Link href={url} passHref>
        <a>
          <Card.Meta avatar={<Avatar src={data.open_graph_image_url} />} title={data.name} />
          <Divider plain></Divider>
          <Row className="stats">
            <Col span={12}>
              <Statistic value={data.stargazers_count} prefix={<FontAwesomeIcon icon={faStar} />} />
            </Col>
            <Col span={12}>
              <Statistic
                value={data.forks_count}
                prefix={<FontAwesomeIcon icon={faCodeBranch} />}
              />
            </Col>
          </Row>
          <Divider plain></Divider>
          <Row className="views">
            <Col span={24}>{ProjectTimeseries()}</Col>
          </Row>
        </a>
      </Link>
    </Card>
  );
}

export default function Home(): JSX.Element {
  const { samples, isError, isLoading } = useSamples(12);
  const cards = samples?.repositories.map((sample: IProject) => ProjectCard(sample));

  return (
    <Layout>
      <section className="content">
        <header>
          Monitoring popular <FontAwesomeIcon icon={faGithub} className="icon" /> projects
        </header>
        <section>
          <span>Find your favorite project ....</span>
          <div className="search-box">
            <Search placeholder="e.g., twbs/bootstrap" size="large" />
          </div>
          <span>or explore the popular ones</span>
          <div className="project-samples">
            <FontAwesomeIcon icon={faSpinner} spin className={isLoading ? '' : 'hidden'} />
            <Result
              status="error"
              subTitle="Sorry, something went wrong when retrieving samples from server."
              className={isError ? 'error' : 'hidden'}
            />
            {cards}
          </div>
        </section>
      </section>
    </Layout>
  );
}
