import React from 'react';
import Link from 'next/link';
import { Card, Avatar, Divider, Statistic, Row, Col } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import { XYPlot, XAxis, LineSeries } from 'react-vis';

import './RepositoryCard.module.less';

interface IRepository extends Record<string, any> {
  description: string;
  name_with_owner: string;
  name: string;
  open_graph_image_url: string;
  stargazers_count: number;
  forks_count: number;
}

const stats: { field: string; icon: any }[] = [
  { field: 'stargazers_count', icon: faStar },
  { field: 'forks_count', icon: faCodeBranch }
];

export default function RepositoryCard(props: { repository: IRepository }): JSX.Element {
  return (
    <Card className="card">
      <Link href={`/explore/${props.repository.name_with_owner}`} passHref>
        <a>
          <Card.Meta
            avatar={<Avatar src={props.repository.open_graph_image_url} />}
            title={props.repository.name}
            className="card-header"
          />
          <Divider plain></Divider>
          <Row className="stats">
            {stats.map((stat) => (
              <Col key={stat.field} className="stat">
                <Statistic
                  value={props.repository[stat.field]}
                  prefix={<FontAwesomeIcon icon={stat.icon} />}
                />
              </Col>
            ))}
          </Row>
          <Divider plain></Divider>
          <Row className="views">
            <Col span={24} className="description">
              {(props.repository.description || '').slice(0, 100) +
                ((props.repository.description || '').length > 100 ? ' ...' : '')}
            </Col>
            <Col span={24} className="extra">
              <XYPlot height={125} width={225} className="plot">
                <XAxis title="stars (last month)" hideLine hideTicks top={110} position="middle" />
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
            </Col>
          </Row>
        </a>
      </Link>
    </Card>
  );
}
