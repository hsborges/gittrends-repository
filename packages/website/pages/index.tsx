import React, { useEffect, useState } from 'react';
import Router from 'next/router';
import numeral from 'numeral';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faGithubAlt } from '@fortawesome/free-brands-svg-icons';
import { faStar, faTag, faUser } from '@fortawesome/free-solid-svg-icons';
import { Stat, StatLabel, StatNumber } from '@chakra-ui/react';

import ServerError from '../components/ServerError';
import ProjectCard from '../components/RepositoryCard';
import Search from '../components/Search';
import Layout from '../layouts/DefaultLayout';
import fetchProjects from '../hooks/searchProjects';
import fetchStatistics from '../hooks/fetchStatistics';
import useWindowDimensions from '../hooks/useWindowDimensions';

import styles from './index.module.scss';

export default function Home(): JSX.Element {
  const { data: sData } = fetchStatistics();
  const { data, isError } = fetchProjects({ limit: 8, sortBy: 'random' });
  const { width } = useWindowDimensions();

  const [statistics, setStatistics] =
    useState<{ title: string; value: number | null; icon: any }[]>();

  useEffect(() => {
    setStatistics([
      { title: 'Projects', icon: faGithubAlt, value: sData?.repositories },
      { title: 'Users', icon: faUser, value: sData?.users },
      { title: 'Stargazers', icon: faStar, value: sData?.stargazers },
      { title: 'Tags', icon: faTag, value: sData?.tags }
    ]);
  }, [sData]);

  return (
    <Layout className={styles['index-page']}>
      <header>
        Monitoring popular <FontAwesomeIcon icon={faGithub} className={styles.icon} /> projects
      </header>
      <section>
        <span>Find your favorite project ....</span>
        <div className={styles['search-box']}>
          <Search
            placeholder="e.g., twbs/bootstrap"
            size="large"
            onSearch={(value: string) =>
              Router.push({ pathname: '/explorer', query: { query: value } })
            }
            onSelectOption={(value: string) => Router.push({ pathname: `/explorer/${value}` })}
          />
        </div>
        <span>or explore the popular ones</span>
        <div className={styles['project-samples']} hidden={isError}>
          {data?.repositories.map((sample) => (
            <ProjectCard
              key={`repository_card_${sample.name_with_owner}`}
              repository={sample.name_with_owner}
              className="card"
            />
          ))}
        </div>
        <div className={styles['db-statistics']}>
          {statistics?.map((stats) => (
            <Stat key={stats.title} className={styles['db-stats']}>
              <StatLabel>{stats.title}</StatLabel>
              <StatNumber className={styles['db-stats-number']}>
                <FontAwesomeIcon icon={stats.icon} className={styles['db-stats-icon']} />
                {width > 600
                  ? numeral(stats.value).format('0,0')
                  : numeral(stats.value).format('0a').toUpperCase()}
              </StatNumber>
            </Stat>
          ))}
        </div>
        <div hidden={!isError}>
          <ServerError />
        </div>
      </section>
    </Layout>
  );
}
