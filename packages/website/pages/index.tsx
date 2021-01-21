import React from 'react';
import Router from 'next/router';
import ServerError from '../components/ServerError';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import ProjectCard from '../components/RepositoryCard';
import Search from '../components/Search';
import Layout from '../layouts/DefaultLayout';
import fetchProjects from '../hooks/useSearch';

import './index.module.less';

export default function Home(): JSX.Element {
  const { data, isError, isLoading } = fetchProjects({ limit: 8, sortBy: 'random' });

  return (
    <Layout>
      <section className="content">
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
            <FontAwesomeIcon icon={faSpinner} spin className={isLoading ? '' : 'hidden'} />
            {data?.repositories.map((sample) => (
              <ProjectCard key={sample.id} repository={sample} className="card" />
            ))}
          </div>
          <div hidden={!isError}>
            <ServerError />
          </div>
        </section>
      </section>
    </Layout>
  );
}
