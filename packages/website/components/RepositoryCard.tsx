import React from 'react';
import Link from 'next/link';
import numeral from 'numeral';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import { FlexibleWidthXYPlot, XAxis, LineSeries } from 'react-vis';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Avatar, Card, CardHeader, CardContent, Divider } from '@material-ui/core';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

import fetchProject from '../hooks/fetchProject';
import styles from './RepositoryCard.module.scss';

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
    <Card {...cardProps} className={`${styles['repository-card']} ${cardProps.className ?? ''}`}>
      <Link href={`/explorer/${repository?.name_with_owner}`} passHref>
        <a>
          <CardHeader
            avatar={
              <Avatar
                src={repository?.open_graph_image_url}
                className={styles['card-header-avatar']}
              />
            }
            title={<span className={styles['card-header-title']}>{repository?.name}</span>}
            className={styles['card-header']}
          />
          <Divider />
          <CardContent className={styles.stats}>
            {stats.map((stat) => (
              <span key={stat.field} className={styles.stat}>
                <FontAwesomeIcon icon={stat.icon} className={styles['stat-icon']} />
                {numeral(repository?.[stat.field]).format('0,0')}
              </span>
            ))}
          </CardContent>
          <Divider />
          <CardContent className={styles.views}>
            <span className={styles.description}>
              {repository?.description || '<no_description_available>'}
            </span>
          </CardContent>
          {/* <Card.Meta
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
          </Row> */}
        </a>
      </Link>
    </Card>
  );
}
