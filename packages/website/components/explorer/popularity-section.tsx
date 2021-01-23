import React, { useEffect, useState } from 'react';
import numeral from 'numeral';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import * as ReactVis from 'react-vis';
import { Card, Select, Switch } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faArrowAltCircleUp, faStar, faTag } from '@fortawesome/free-solid-svg-icons';
import Avatar from 'antd/lib/avatar/avatar';
import Link from 'next/link';

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

    console.log(tags);

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
    <section className={`gittrends-repository-popularity-section ${props.className ?? ''}`}>
      <div className="statistics">
        <Card title="Oldest stargazer" size="small" className="card">
          <Card.Meta
            avatar={<Avatar src={props.first?.user.avatar_url} />}
            title={
              <span className="card-title">
                <Link href={`https://github.com/${props.first?.user.login}`} passHref>
                  <a target="_blank" rel="noreferrer">
                    <span>{props.first?.user.name || props.first?.user.login}</span>{' '}
                    <FontAwesomeIcon icon={faGithub} className="icon" />
                  </a>
                </Link>
              </span>
            }
            description={dayjs(props.first?.starred_at).format('L LT')}
          />
        </Card>
        <Card title="Newest stargazer" size="small" className="card">
          <Card.Meta
            avatar={<Avatar src={props.last?.user.avatar_url} />}
            title={
              <span className="card-title">
                <Link href={`https://github.com/${props.last?.user.login}`} passHref>
                  <a target="_blank" rel="noreferrer">
                    <span>{props.last?.user.name || props.last?.user.login}</span>{' '}
                    <FontAwesomeIcon icon={faGithub} className="icon" />
                  </a>
                </Link>
              </span>
            }
            description={dayjs(props.last?.starred_at).format('L LT')}
          />
        </Card>
        <Card title="Peak (week)" size="small" className="card">
          <Card.Meta
            avatar={<FontAwesomeIcon icon={faStar} className="avatar-icon" />}
            title={numeral(peak.total).format('0,0') + ' stars'}
            description={
              dayjs.utc(peak.date).subtract(6, 'days').format('[DD') +
              '-' +
              dayjs.utc(peak.date).format('DD]/MM/YYYY')
            }
          />
        </Card>
        <Card title="Recently" size="small" className="card">
          <Card.Meta
            avatar={<FontAwesomeIcon icon={faArrowAltCircleUp} className="avatar-icon" />}
            title={numeral(gainedRecently).format('0,0') + ' stars'}
            description={'since ' + dayjs.utc().startOf('year').format('DD/MM/YYYY')}
          />
        </Card>
      </div>
      <div className="plot-area">
        <ReactVis.FlexibleWidthXYPlot height={300} animation={{ duration: 1 }}>
          <ReactVis.VerticalGridLines />
          <ReactVis.HorizontalGridLines />
          <ReactVis.YAxis
            title="Stargazers"
            tickPadding={2}
            tickFormat={(value) => numeral(transformLabel(value)).format('0a').toUpperCase()}
          />
          <ReactVis.XAxis
            title="Date"
            tickFormat={(value) => dayjs.utc(value).format('YYYY-MM-YY')}
            tickLabelAngle={-20}
          />
          <ReactVis.LineSeries data={timeseries} />
          {showTags &&
            tags.map((tag, index) => (
              <ReactVis.Hint
                key={`tag_${index}`}
                value={{ x: tag.x, y: tag.y }}
                align={{ vertical: 'top' }}
                className="hint"
              >
                <FontAwesomeIcon icon={faTag} rotation={270} color="gray" />
                <span className="tooltip">{tag.names.join(', ')}</span>
              </ReactVis.Hint>
            ))}
        </ReactVis.FlexibleWidthXYPlot>
        <div className="controls">
          <div className="control">
            <span className="label">Series</span>
            <Select
              value={seriesType}
              size="small"
              className="select"
              onChange={(value) => setSeriesType(value)}
            >
              <Select.Option value="weekly">By week</Select.Option>
              <Select.Option value="cumulative">Cumulative</Select.Option>
            </Select>
          </div>
          <div className="control">
            <span className="label">Scale</span>
            <Select
              defaultValue="linear"
              size="small"
              className="select"
              onChange={(value) => setScaleType(value)}
            >
              <Select.Option value="linear">Linear</Select.Option>
              <Select.Option value="log">Logarithm</Select.Option>
            </Select>
          </div>
          {tags && tags.length ? (
            <div className="control">
              <span className="label">Show tags</span>
              <Switch size="small" onChange={(checked) => setShowTags(checked)} />
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    </section>
  );
}
