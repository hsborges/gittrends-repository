import React from 'react';
import Link from 'next/link';
import { Card, Avatar, Divider, Statistic, Row, Col, Empty } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import { XYPlot, XAxis, LineSeries } from 'react-vis';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

import fetchStargazers from '../hooks/fetchStargazers';

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

interface RepositoryCardProps extends React.HTMLAttributes<HTMLElement> {
  repository: IRepository;
}

export default function RepositoryCard(props: RepositoryCardProps): JSX.Element {
  const { repository, ...cardProps } = props;

  const { timeseries, isLoading, isError } = fetchStargazers({
    name_with_owner: repository.name_with_owner
  });

  return (
    <Card {...cardProps} className={`gittrends-repository-card ${cardProps.className ?? ''}`}>
      <Link href={`/explorer/${repository.name_with_owner}`} passHref>
        <a>
          <Card.Meta
            avatar={<Avatar src={repository.open_graph_image_url} />}
            title={repository.name}
            className="card-header"
          />
          <Divider plain></Divider>
          <Row className="stats">
            {stats.map((stat) => (
              <Col key={stat.field} className="stat">
                <Statistic
                  value={repository[stat.field]}
                  prefix={<FontAwesomeIcon icon={stat.icon} />}
                />
              </Col>
            ))}
          </Row>
          <Divider plain></Divider>
          <Row className={`views ${!isLoading ? 'has-extra' : ''}`}>
            <Col span={24} className="description">
              {(repository.description || '').slice(0, 100) +
                ((repository.description || '').length > 100 ? ' ...' : '')}
            </Col>
            <Col span={24} className="extra" hidden={isError}>
              <XYPlot height={125} width={225} className="plot">
                <XAxis title="stars history" hideLine hideTicks top={110} position="middle" />
                <LineSeries
                  curve={null}
                  data={Object.entries(timeseries || {}).reduce(
                    (acc, value) =>
                      acc.concat({
                        x: dayjs(value[0], 'YYYY-MM-DD').toDate().getTime(),
                        y: (acc.length > 0 ? acc[acc.length - 1].y : 0) + value[1]
                      }),
                    []
                  )}
                  opacity={1}
                  strokeStyle="solid"
                  style={{}}
                />
              </XYPlot>
            </Col>
            <Col span={24} className="extra" hidden={!isError}>
              <Empty description="stars history not avaliable yet" className="not-available" />
            </Col>
          </Row>
        </a>
      </Link>
    </Card>
  );
}
