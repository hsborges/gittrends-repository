import { Stat, StatLabel, StatNumber } from '@chakra-ui/react';
import { faGithub, faGithubAlt } from '@fortawesome/free-brands-svg-icons';
import { faStar, faTag, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { shuffle } from 'lodash';
import Router from 'next/router';
import numeral from 'numeral';
import React, { useEffect, useState } from 'react';

import ProjectCard from '../components/RepositoryCard';
import Search from '../components/Search';
import ServerError from '../components/ServerError';
import { useSearch } from '../hooks/api/useSearch';
import { useStats } from '../hooks/api/useStats';
import useWindowDimensions from '../hooks/useWindowDimensions';
import Layout from '../layouts/DefaultLayout';
import styles from './index.module.scss';

export default function Home(): JSX.Element {
  const { data: stats } = useStats();
  const { data: search, error } = useSearch({ limit: 25 });
  const { width } = useWindowDimensions();

  const [statistics, setStatistics] =
    useState<{ title: string; value: number | null; icon: any }[]>();

  useEffect(() => {
    const statsSummary: Record<string, number> = stats?.reduce(
      (m, d) => ({ ...m, [d.resource]: d.count }),
      {}
    );

    setStatistics([
      { title: 'Projects', icon: faGithubAlt, value: statsSummary?.repositories },
      { title: 'Users', icon: faUser, value: statsSummary?.actors },
      { title: 'Stargazers', icon: faStar, value: statsSummary?.stargazers },
      { title: 'Tags', icon: faTag, value: statsSummary?.tags }
    ]);
  }, [stats]);

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
        <div className={styles['project-samples']} hidden={!!error}>
          {shuffle(search?.repos)
            .slice(0, 8)
            .map((sample) => (
              <ProjectCard
                key={`repository_card_${sample.name_with_owner}`}
                repository={sample}
                className={styles.card}
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
        <div hidden={!error}>
          <ServerError />
        </div>
      </section>
    </Layout>
  );
}
