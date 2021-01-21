import React from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Card, Avatar, Divider, Statistic, Row, Col, Empty } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import { XYPlot, XAxis, LineSeries } from 'react-vis';
import fetchStargazers from '../hooks/useStargazers';

interface IRepository extends Record<string, any> {
  description: string;
  name_with_owner: string;
  name: string;
  open_graph_image_url: string;
  stargazers_count: number;
  forks_count: number;
}

dayjs.extend(customParseFormat);

const stats: { field: string; icon: any }[] = [
  { field: 'stargazers_count', icon: faStar },
  { field: 'forks_count', icon: faCodeBranch }
];

interface RepositoryCardProps extends React.HTMLAttributes<HTMLElement> {
  repository: IRepository;
}

export default function RepositoryCard(props: RepositoryCardProps): JSX.Element {
  const { timeseries, isLoading, isError } = fetchStargazers({
    name_with_owner: props.repository.name_with_owner
  });

  return (
    <Card {...props} className={`gittrends-repository-card ${props.className}`}>
      <Link href={`/explorer/${props.repository.name_with_owner}`} passHref>
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
          <Row className={`views ${!isLoading && 'has-extra'}`}>
            <Col span={24} className="description">
              {(props.repository.description || '').slice(0, 100) +
                ((props.repository.description || '').length > 100 ? ' ...' : '')}
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
