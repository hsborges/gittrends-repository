import {
  faBalanceScale,
  faBug,
  faClock,
  faCode,
  faCodeBranch,
  faEye,
  faHandsHelping,
  faHdd,
  faNetworkWired,
  faRocket,
  faStar,
  faTag,
  faUnlock,
  faUpload
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import camelCase from 'lodash/camelCase';
import numeral from 'numeral';
import React from 'react';

import styles from './overview-section.module.scss';

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
      <div className={styles.table}>
        {overviewInfo
          .filter((info) => info.value)
          .map((info, index) => (
            <span key={index} className={styles.cell}>
              <div>
                <span title={info.title ?? info.label} className={styles.title}>
                  <FontAwesomeIcon icon={info.icon} className="icon" /> {info.label}
                </span>
              </div>
              <div>{info.value}</div>
            </span>
          ))}
      </div>
    </section>
  );
}
