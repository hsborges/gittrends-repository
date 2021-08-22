import React from 'react';
import Link from 'next/link';
import { Anchor, Tag } from 'antd';
import { Avatar, Breadcrumb, BreadcrumbItem } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

import DefaultLayout from '../../../layouts/DefaultLayout';
import Divider from '../../../components/explorer/divider';
import OverviewSection from '../../../components/explorer/overview-section';
import PopularitySection from '../../../components/explorer/popularity-section';

import fetchRepository from '../../../hooks/fetchProject';

import styles from './[name].module.scss';

function ProjectDetails(props: { name_with_owner: string }): JSX.Element {
  const { repository } = fetchRepository({ name_with_owner: props.name_with_owner });

  return (
    <DefaultLayout showSearch>
      <section className={styles['project-explorer']}>
        <header>
          <Breadcrumb className={styles.breadcrumb}>
            <BreadcrumbItem>
              <Link href="/" as="/" passHref>
                <a>
                  <FontAwesomeIcon icon={faHome} className={styles.icon} />
                  <span>Home</span>
                </a>
              </Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Link href="/explorer" as="/explorer" passHref>
                <a>
                  <span>Explorer</span>
                </a>
              </Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <span>{repository?.name}</span>
            </BreadcrumbItem>
          </Breadcrumb>
        </header>

        <section className={styles.content}>
          <section className={styles.title}>
            <div>
              <Avatar src={repository?.open_graph_image_url} size="md" className={styles.avatar} />
              <span>{repository?.name_with_owner}</span>
            </div>
            <span className={styles.description}>{repository?.description}</span>
            <span className={styles.topics} hidden={!repository?.repository_topics}>
              {repository?.repository_topics?.map((topic, index) => (
                <Tag key={index} className={styles.topic}>
                  {topic}
                </Tag>
              ))}
            </span>
          </section>

          <Divider id="overview" title="Overview" className={styles.divider} />
          <OverviewSection repository={repository} />

          {repository?.stargazers.timeseries && (
            <>
              <Divider id="popularity" title="Popularity" className={styles.divider} />
              <PopularitySection
                timeseries={repository?.stargazers.timeseries}
                first={repository?.stargazers.first}
                last={repository?.stargazers.last}
                tags={repository?.tags}
              />
            </>
          )}
        </section>
      </section>
    </DefaultLayout>
  );
}

ProjectDetails.getInitialProps = ({ query }): { name_with_owner: string } => {
  return { name_with_owner: `${query.owner}/${query.name}` };
};

export default ProjectDetails;
