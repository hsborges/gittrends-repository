import React, { useEffect, useState } from 'react';
import Router from 'next/router';
import { Statistic } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faGithubAlt } from '@fortawesome/free-brands-svg-icons';
import { faStar, faTag, faUser } from '@fortawesome/free-solid-svg-icons';

import ServerError from '../components/ServerError';
import ProjectCard from '../components/RepositoryCard';
import Search from '../components/Search';
import Layout from '../layouts/DefaultLayout';
import fetchProjects from '../hooks/searchProjects';
import fetchStatistics from '../hooks/fetchStatistics';

import './index.module.less';

export default function Home(): JSX.Element {
  const { data: sData } = fetchStatistics();
  const { data, isError } = fetchProjects({ limit: 8, sortBy: 'random' });

  const [statistics, setStatistics] = useState<
    { title: string; value: number | null; icon: any }[]
  >();

  useEffect(() => {
    setStatistics([
      { title: 'Projects', icon: faGithubAlt, value: sData?.repositories },
      { title: 'Users', icon: faUser, value: sData?.users },
      { title: 'Stargazers', icon: faStar, value: sData?.stargazers },
      { title: 'Tags', icon: faTag, value: sData?.tags }
    ]);
  }, [sData]);

  return (
    <Layout className="github-index-page">
      <header>
        Monitoring popular <FontAwesomeIcon icon={faGithub} className="icon" /> projects
      </header>
      <section>
        <span>Find your favorite project ....</span>
        <div className="search-box">
          <Search
            placeholder="e.g., twbs/bootstrap"
            size="large"
            onSearch={(value) => Router.push({ pathname: '/explorer', query: { query: value } })}
          />
        </div>
        <span>or explore the popular ones</span>
        <div className="project-samples" hidden={isError}>
          {data?.repositories.map((sample) => (
            <ProjectCard
              key={sample.name_with_ownerid}
              repository={sample.name_with_owner}
              className="card"
            />
          ))}
        </div>
        <div className="db-statistics">
          {statistics?.map((stats) => (
            <Statistic
              key={stats.title}
              title={stats.title}
              value={stats.value}
              prefix={<FontAwesomeIcon icon={stats.icon} />}
              className="db-stats"
              loading={!stats.value}
            />
          ))}
        </div>
        <div hidden={!isError}>
          <ServerError />
        </div>
      </section>
    </Layout>
  );
}
