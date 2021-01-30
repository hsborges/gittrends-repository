import React from 'react';
import numeral from 'numeral';
import camelCase from 'lodash/camelCase';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Descriptions } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBalanceScale,
  faBug,
  faClock,
  faCode,
  faCodeBranch,
  faEye,
  faHandsHelping,
  faHdd,
  faHome,
  faNetworkWired,
  faRocket,
  faStar,
  faTag,
  faUnlock,
  faUpload
} from '@fortawesome/free-solid-svg-icons';

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
      icon: faHome,
      value: repository?.homepage_url,
      span: 2,
      link: true
    },
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
    <section {...props}>
      <Descriptions
        layout="vertical"
        bordered
        colon={false}
        column={window.innerWidth >= 576 ? 4 : 3}
        size="small"
      >
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
