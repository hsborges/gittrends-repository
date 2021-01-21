import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import numeral from 'numeral';
import camelCase from 'lodash/camelCase';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Anchor, Avatar, Breadcrumb, Descriptions } from 'antd';
import {
  XYPlot,
  LineSeries,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis
} from 'react-vis';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faCode,
  faStar,
  faEye,
  faNetworkWired,
  faHandsHelping,
  faCodeBranch,
  faBug,
  faBalanceScale,
  faUpload,
  faTag,
  faClock,
  faRocket,
  faUnlock,
  faHdd
} from '@fortawesome/free-solid-svg-icons';
import DefaultLayout from '../../layouts/DefaultLayout';
import fetchRepository from '../../hooks/useRepository';
import fetchStargazers from '../../hooks/useStargazers';

import './[...params].module.less';

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

export default function ProjectDetails(): JSX.Element {
  const [affixOffset] = useState(10);
  const router = useRouter();

  const nameWithOwner = (Array.isArray(router.query.params)
    ? router.query.params
    : [router.query.params]
  ).join('/');

  const { repository } = fetchRepository({ name_with_owner: nameWithOwner });
  const { timeseries } = fetchStargazers({ name_with_owner: nameWithOwner });

  const overviewInfo = [
    {
      label: 'Stargazers',
      icon: faStar,
      value: repository && numeral(repository.stargazers_count).format('0,0')
    },
    {
      label: 'Watchers',
      icon: faEye,
      value: repository && numeral(repository.watchers_count).format('0,0')
    },
    {
      label: 'Forks',
      icon: faNetworkWired,
      value: repository && numeral(repository.forks_count).format('0,0')
    },
    { label: 'Language', icon: faCode, value: repository?.primary_language },
    { label: 'Homepage', icon: faHome, value: repository?.homepage_url, span: 2, link: true },
    {
      label: 'Default Branch',
      icon: faCodeBranch,
      value: repository?.default_branch
    },
    {
      label: 'CoC',
      title: 'Code of Conduct',
      icon: faHandsHelping,
      value: repository?.code_of_conduct && camelCase(repository?.code_of_conduct)
    },
    {
      label: 'Liscense',
      icon: faBalanceScale,
      value: repository?.license_info
    },
    {
      label: 'Total issues',
      icon: faBug,
      value: repository && numeral(repository.issues_count).format('0,0')
    },
    {
      label: 'Total pulls',
      icon: faUpload,
      value: repository && numeral(repository.pull_requests_count_count).format('0,0')
    },
    {
      label: 'Releases',
      icon: faTag,
      value: repository && numeral(repository.releases_count).format('0,0')
    },
    {
      label: 'Vulnerabilities',
      icon: faUnlock,
      value: repository && numeral(repository.vulnerability_alerts_count).format('0,0')
    },
    {
      label: 'Created at',
      icon: faRocket,
      value: repository && dayjs(repository.created_at).from(Date.now())
    },
    {
      label: 'Last updated',
      icon: faClock,
      value: repository && dayjs(repository.updated_at).from(Date.now())
    },
    {
      label: 'Size',
      icon: faHdd,
      value: repository && numeral(repository.disk_usage).format('0.0 b')
    }
  ];

  return (
    <DefaultLayout>
      <section className="project-explorer">
        <header>
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item>
              <Link href="/" as="/" passHref>
                <a>
                  <FontAwesomeIcon icon={faHome} className="icon" />
                  <span>Home</span>
                </a>
              </Link>
            </Breadcrumb.Item>
            <Link href="/explorer" as="/explorer" passHref>
              <Breadcrumb.Item>
                <span>Explorer</span>
              </Breadcrumb.Item>
            </Link>
            <Breadcrumb.Item>
              <span>{repository?.name}</span>
            </Breadcrumb.Item>
          </Breadcrumb>
          <Anchor className="anchor" affix offsetTop={affixOffset}>
            <Anchor.Link href="#overview" title="Overview" />
            <Anchor.Link href="#popularity" title="Popularity" />
          </Anchor>
        </header>

        <section className="title">
          <div>
            <Avatar src={repository?.open_graph_image_url} size="large" />
            <span>{repository?.name_with_owner}</span>
          </div>
          <span className="description">{repository?.description}</span>
        </section>
        <section id="overview" className="overview">
          <Descriptions layout="vertical" bordered colon={false} column={4}>
            {overviewInfo.map(
              (info) =>
                info.value && (
                  <Descriptions.Item
                    labelStyle={{ margin: '0px' }}
                    key={info.value}
                    span={info.span}
                    label={
                      <span title={info.title ?? info.label}>
                        <FontAwesomeIcon icon={info.icon} className="icon" /> {info.label}
                      </span>
                    }
                  >
                    <a
                      href={info.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      hidden={!info.link}
                    >
                      {info.value}
                    </a>
                    <span hidden={info.link}>{info.value}</span>
                  </Descriptions.Item>
                )
            )}
          </Descriptions>
        </section>
        <section id="popularity" className="popularity">
          <XYPlot width={800} height={300}>
            <YAxis title="Stargazers" />
            <XAxis
              title="Date"
              tickFormat={(value) => dayjs.utc(value).format('YYYY-MM-YY')}
              tickLabelAngle={-15}
            />
            <LineSeries
              data={
                timeseries &&
                Object.entries(timeseries).map((entry) => ({
                  x: dayjs.utc(entry[0], 'YYYY-MM-DD').toDate().getTime(),
                  y: entry[1]
                }))
              }
            />
          </XYPlot>
        </section>
      </section>
    </DefaultLayout>
  );
}
