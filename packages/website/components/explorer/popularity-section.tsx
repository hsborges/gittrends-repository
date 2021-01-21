import React, { useEffect, useState } from 'react';
import numeral from 'numeral';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { FlexibleWidthXYPlot, LineSeries, XAxis, YAxis } from 'react-vis';
import { Select } from 'antd';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

interface PopularitySectionAttributes extends React.HTMLAttributes<HTMLElement> {
  timeseries: Record<string, number>;
  first: object;
  last: object;
}

export default function PopularitySection(props: PopularitySectionAttributes): JSX.Element {
  const [timeseries, setTimeseries] = useState([]);
  const [seriesType, setSeriesType] = useState('weekly');
  const [scaleType, setScaleType] = useState('linear');

  const transformValue = (value) => (scaleType === 'linear' ? value : Math.log10(value));
  const transformLabel = (value) => (scaleType === 'linear' ? value : Math.pow(10, value));

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

  return (
    <section className={`gittrends-repository-popularity-section ${props.className ?? ''}`}>
      <div className="plot-area">
        <FlexibleWidthXYPlot height={300} animation={{ duration: 1 }}>
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
        </FlexibleWidthXYPlot>
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
        </div>
      </div>
    </section>
  );
}
