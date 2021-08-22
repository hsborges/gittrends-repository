import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import classnames from 'classnames';
import { Box, Avatar, Select, Switch } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faArrowAltCircleUp, faStar, faTag } from '@fortawesome/free-solid-svg-icons';

import numeral from 'numeral';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import {
  FlexibleWidthXYPlot,
  VerticalGridLines,
  HorizontalGridLines,
  YAxis,
  XAxis,
  LineSeries,
  Hint
} from 'react-vis';

import styles from './popularity-section.module.scss';

dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);

interface PopularitySectionAttributes extends React.HTMLAttributes<HTMLElement> {
  timeseries: Record<string, number>;
  first: Record<string, any>;
  last: Record<string, any>;
  tags?: Array<any>;
}

export default function PopularitySection(props: PopularitySectionAttributes): JSX.Element {
  const [tags, setTags] = useState([]);
  const [showTags, setShowTags] = useState(false);
  const [timeseries, setTimeseries] = useState([]);
  const [seriesType, setSeriesType] = useState('weekly');
  const [scaleType, setScaleType] = useState('linear');

  const transformValue = (value) => (scaleType === 'linear' ? value : Math.log10(value));
  const transformLabel = (value) => (scaleType === 'linear' ? value : Math.pow(10, value));

  const peak: { date: Date; total: number } = Object.entries(props.timeseries ?? {}).reduce(
    (peak, value) => {
      if (peak.total && peak.total > value[1]) return peak;
      return { date: dayjs.utc(value[0], 'YYYY-MM-DD').toDate(), total: value[1] };
    },
    { date: null, total: null }
  );

  const gainedRecently = Object.entries(props.timeseries ?? {})
    .filter(([d]) => dayjs.utc(d, 'YYYY-MM-DD').isSame(new Date(), 'year'))
    .reduce((acc, v) => acc + v[1], 0);

  useEffect(() => {
    setTimeseries(
      Object.entries(props.timeseries ?? {}).reduce(
        (acc, entry) =>
          acc.concat({
            x: dayjs.utc(entry[0], 'YYYY-MM-DD').toDate().getTime(),
            y: transformValue(
              entry[1] + (seriesType === 'weekly' || !acc.length ? 0 : acc[acc.length - 1].y)
            )
          }),
        []
      )
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesType, scaleType, props.timeseries]);

  useEffect(() => {
    const data: Record<string, []> = props.tags?.reduce((acc, tag) => {
      const week = dayjs.utc(tag.committed_date).endOf('week').startOf('day').toDate().getTime();
      if (!acc[`${week}`]) acc[`${week}`] = [];
      acc[`${week}`].push(tag.name);
      return acc;
    }, {});

    setTags(
      Object.entries(data || {})
        .map((entry) => ({
          x: parseInt(entry[0], 10),
          y: timeseries.find((v) => v.x == parseInt(entry[0], 10))?.y,
          names: entry[1]
        }))
        .filter((d) => d.y)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesType, scaleType, timeseries, props.tags]);

  return (
    <section className={classnames(styles['popularity-section'], props.className)}>
      <div className={styles.statistics}>
        <Box className={styles.card}>
          <Box className={styles.header}>Oldest stargazer</Box>
          <Box className={styles.content}>
            <Avatar className={styles.avatar} src={props.first?.user.avatar_url} size="sm" />
            <span className={styles.description}>
              <Link href={`https://github.com/${props.first?.user.login}`} passHref>
                <a target="_blank" rel="noreferrer">
                  <span>{props.first?.user.name || props.first?.user.login}</span>{' '}
                  <FontAwesomeIcon icon={faGithub} className={styles.icon} />
                </a>
              </Link>
              <span>{dayjs(props.first?.starred_at).format('L LT')}</span>
            </span>
          </Box>
        </Box>
        <Box className={styles.card}>
          <Box className={styles.header}>Newest stargazer</Box>
          <Box className={styles.content}>
            <Avatar className={styles.avatar} src={props.last?.user.avatar_url} size="sm" />
            <span className={styles.description}>
              <Link href={`https://github.com/${props.last?.user.login}`} passHref>
                <a target="_blank" rel="noreferrer">
                  <span>{props.last?.user.name || props.last?.user.login}</span>{' '}
                  <FontAwesomeIcon icon={faGithub} className={styles.icon} />
                </a>
              </Link>
              <span>{dayjs(props.last?.starred_at).format('L LT')}</span>
            </span>
          </Box>
        </Box>
        <Box className={styles.card}>
          <Box className={styles.header}>Peak (week)</Box>
          <Box className={styles.content}>
            <Avatar
              className={styles.avatar}
              size="sm"
              icon={<FontAwesomeIcon icon={faStar} size="2x" />}
              bg="none"
              color="var(--primary-color)"
            />
            <span className={styles.description}>
              <span>{numeral(peak.total).format('0,0') + ' stars'}</span>
              <span>
                {dayjs.utc(peak.date).subtract(6, 'days').format('[DD') +
                  '-' +
                  dayjs.utc(peak.date).format('DD]') +
                  dayjs.utc(peak.date).format(' MMMM YYYY')}
              </span>
            </span>
          </Box>
        </Box>
        <Box className={styles.card}>
          <Box className={styles.header}>Recently</Box>
          <Box className={styles.content}>
            <Avatar
              className={styles.avatar}
              size="sm"
              icon={<FontAwesomeIcon icon={faArrowAltCircleUp} size="2x" />}
              bg="none"
              color="var(--primary-color)"
            />
            <span className={styles.description}>
              <span>{numeral(gainedRecently).format('0,0') + ' stars'}</span>
              <span>this year</span>
            </span>
          </Box>
        </Box>
      </div>
      <div className={styles['plot-area']}>
        <FlexibleWidthXYPlot
          height={window.innerWidth >= 576 ? 300 : 200}
          animation={{ duration: 1 }}
        >
          <VerticalGridLines />
          <HorizontalGridLines />
          <YAxis
            title="Stargazers"
            tickPadding={2}
            tickFormat={(value) => numeral(transformLabel(value)).format('0a').toUpperCase()}
          />
          <XAxis
            title="Date"
            tickFormat={(value) => dayjs.utc(value).format('YYYY-MM-YY')}
            tickLabelAngle={-20}
          />
          <LineSeries data={timeseries} />
          {showTags &&
            tags.map((tag, index) => (
              <Hint
                key={`tag_${index}`}
                value={{ x: tag.x, y: tag.y }}
                align={{ vertical: 'top' }}
                className={styles.hint}
              >
                <FontAwesomeIcon icon={faTag} rotation={270} color="gray" />
                <span className={styles.tooltip}>{tag.names.join(', ')}</span>
              </Hint>
            ))}
        </FlexibleWidthXYPlot>
        <div className={styles.controls}>
          <div className={styles.control}>
            <span className={styles.label}>Series</span>
            <Select
              value={seriesType}
              size="sm"
              className={styles.select}
              onChange={(event) => setSeriesType(event.target.value)}
            >
              <option value="weekly">By week</option>
              <option value="cumulative">Cumulative</option>
            </Select>
          </div>
          <div className={styles.control}>
            <span className={styles.label}>Scale</span>
            <Select
              defaultValue="linear"
              size="sm"
              className={styles.select}
              onChange={(event) => setScaleType(event.target.value)}
            >
              <option value="linear">Linear</option>
              <option value="log">Logarithm</option>
            </Select>
          </div>
          {tags && tags.length ? (
            <div className={styles.control}>
              <span className={styles.label}>Show tags</span>
              <Switch
                color="var(--primary-color)"
                ml={1}
                onChange={(event) => setShowTags(event.target.checked)}
              />
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    </section>
  );
}
