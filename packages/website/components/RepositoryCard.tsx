import React from 'react';
import Link from 'next/link';
import { truncate } from 'lodash';
import { Card, Avatar, Divider, Statistic, Row, Col, Empty } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import { FlexibleWidthXYPlot, XAxis, LineSeries } from 'react-vis';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

import fetchProject from '../hooks/fetchProject';

const stats: { field: string; icon: any }[] = [
  { field: 'stargazers_count', icon: faStar },
  { field: 'forks_count', icon: faCodeBranch }
];

interface RepositoryCardProps extends React.HTMLAttributes<HTMLElement> {
  repository: string;
}

export default function RepositoryCard(props: RepositoryCardProps): JSX.Element {
  const { ...cardProps } = props;
  const { repository } = fetchProject({ name_with_owner: props.repository });

  return (
    <Card {...cardProps} className={`gittrends-repository-card ${cardProps.className ?? ''}`}>
      <Link href={`/explorer/${repository?.name_with_owner}`} passHref>
        <a>
          <Card.Meta
            avatar={<Avatar src={repository?.open_graph_image_url} />}
            title={repository?.name}
            className="card-header"
          />
          <Divider plain></Divider>
          <Row className="stats">
            {stats.map((stat) => (
              <Col key={stat.field} className="stat">
                <Statistic
                  value={repository?.[stat.field]}
                  prefix={<FontAwesomeIcon icon={stat.icon} />}
                />
              </Col>
            ))}
          </Row>
          <Divider plain></Divider>
          <Row className={`views ${repository?.stargazers ? 'has-extra' : ''}`}>
            <Col span={24} className="description">
              {truncate(repository?.description || '<no_description_available>', {
                length: window.innerWidth < 600 ? 60 : 95
              })}
            </Col>
            <Col span={24} className="extra" hidden={!repository?.stargazers?.timeseries}>
              <FlexibleWidthXYPlot
                height={90}
                className="plot"
                margin={{ left: 0, right: 0, bottom: 20, top: 0 }}
              >
                <XAxis title={'stars'} hideLine hideTicks top={95} position="middle" />
                <LineSeries
                  curve={null}
                  data={Object.entries(repository?.stargazers.timeseries || {}).reduce(
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
              </FlexibleWidthXYPlot>
            </Col>
            <Col span={24} className="extra" hidden={repository?.stargazers?.timeseries}>
              <Empty description="stars history not avaliable yet" className="not-available" />
            </Col>
          </Row>
        </a>
      </Link>
    </Card>
  );
}
