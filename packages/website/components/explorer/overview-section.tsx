import React from 'react';
import numeral from 'numeral';
import camelCase from 'lodash/camelCase';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Descriptions } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as FontAwesomeSolidIcons from '@fortawesome/free-solid-svg-icons';

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

interface OverviewSectionAttributes extends React.HTMLAttributes<HTMLElement> {
  repository: Record<string, any>;
}

export default function OverviewSection(props: OverviewSectionAttributes): JSX.Element {
  const { repository } = props;

  const overviewInfo = [
    {
      label: 'Homepage',
      icon: FontAwesomeSolidIcons.faHome,
      value: repository?.homepage_url,
      span: 2,
      link: true
    },
    {
      label: 'Stargazers',
      icon: FontAwesomeSolidIcons.faStar,
      value: repository && numeral(repository.stargazers_count).format('0,0')
    },
    {
      label: 'Watchers',
      icon: FontAwesomeSolidIcons.faEye,
      value: repository && numeral(repository.watchers_count).format('0,0')
    },
    {
      label: 'Forks',
      icon: FontAwesomeSolidIcons.faNetworkWired,
      value: repository && numeral(repository.forks_count).format('0,0')
    },
    { label: 'Language', icon: FontAwesomeSolidIcons.faCode, value: repository?.primary_language },
    {
      label: 'Default Branch',
      icon: FontAwesomeSolidIcons.faCodeBranch,
      value: repository?.default_branch
    },
    {
      label: 'CoC',
      title: 'Code of Conduct',
      icon: FontAwesomeSolidIcons.faHandsHelping,
      value: repository?.code_of_conduct && camelCase(repository?.code_of_conduct)
    },
    {
      label: 'Liscense',
      icon: FontAwesomeSolidIcons.faBalanceScale,
      value: repository?.license_info
    },
    {
      label: 'Total issues',
      icon: FontAwesomeSolidIcons.faBug,
      value: repository && numeral(repository.issues_count).format('0,0')
    },
    {
      label: 'Total pulls',
      icon: FontAwesomeSolidIcons.faUpload,
      value: repository && numeral(repository.pull_requests_count_count).format('0,0')
    },
    {
      label: 'Releases',
      icon: FontAwesomeSolidIcons.faTag,
      value: repository && numeral(repository.releases_count).format('0,0')
    },
    {
      label: 'Vulnerabilities',
      icon: FontAwesomeSolidIcons.faUnlock,
      value: repository && numeral(repository.vulnerability_alerts_count).format('0,0')
    },
    {
      label: 'Created at',
      icon: FontAwesomeSolidIcons.faRocket,
      value: repository && dayjs(repository.created_at).from(Date.now())
    },
    {
      label: 'Last updated',
      icon: FontAwesomeSolidIcons.faClock,
      value: repository && dayjs(repository.updated_at).from(Date.now())
    },
    {
      label: 'Size',
      icon: FontAwesomeSolidIcons.faHdd,
      value: repository && numeral(repository.disk_usage).format('0.0 b')
    }
  ];

  return (
    <section {...props}>
      <Descriptions layout="vertical" bordered colon={false} column={4} size="small">
        {overviewInfo
          .filter((info) => info.value)
          .map((info, index) => (
            <Descriptions.Item
              key={index}
              span={info.span}
              label={
                <span title={info.title ?? info.label}>
                  <FontAwesomeIcon icon={info.icon} className="icon" /> {info.label}
                </span>
              }
            >
              <a href={info.value} target="_blank" rel="noopener noreferrer" hidden={!info.link}>
                {info.value}
              </a>
              <span hidden={info.link}>{info.value}</span>
            </Descriptions.Item>
          ))}
      </Descriptions>
    </section>
  );
}
