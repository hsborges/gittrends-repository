import { Avatar, Breadcrumb, BreadcrumbItem, Tag } from '@chakra-ui/react';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import React from 'react';

import Divider from '../../../components/explorer/divider';
import OverviewSection from '../../../components/explorer/overview-section';
import PopularitySection from '../../../components/explorer/popularity-section';
import { useRepository } from '../../../hooks/api/useRepository';
import { useStargazerTimeseries } from '../../../hooks/api/useStargazerTimeseries';
import DefaultLayout from '../../../layouts/DefaultLayout';
import styles from './[name].module.scss';

function ProjectDetails(props: { owner: string; name: string }): JSX.Element {
  const { data: repo } = useRepository({ idOrOwner: props.owner, name: props.name });
  const { data: tsResult } = useStargazerTimeseries({ idOrOwner: props.owner, name: props.name });

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
              <span>{repo?.name}</span>
            </BreadcrumbItem>
          </Breadcrumb>
        </header>

        <section className={styles.content}>
          <section className={styles.title}>
            <div>
              <Avatar src={repo?.open_graph_image_url} size="md" className={styles.avatar} />
              <span>{repo?.name_with_owner}</span>
            </div>
            <span className={styles.description}>
              {repo?.description} <br />
              <a href={repo?.homepage_url}>{repo?.homepage_url}</a>
            </span>
            <span className={styles.topics} hidden={!repo?.repository_topics}>
              {repo?.repository_topics?.map((topic, index) => (
                <Tag key={index} className={styles.topic}>
                  {topic}
                </Tag>
              ))}
            </span>
          </section>

          <OverviewSection repository={repo} />

          {tsResult ? (
            <>
              <Divider id="popularity" title="Popularity" className={styles.divider} />
              <PopularitySection
                timeseries={tsResult.timeseries}
                first={tsResult.first}
                last={tsResult.last}
                // tags={repo?.tags}
              />
            </>
          ) : (
            <></>
          )}
        </section>
      </section>
    </DefaultLayout>
  );
}

ProjectDetails.getInitialProps = ({ query: { name, owner } }) => {
  return { name, owner };
};

export default ProjectDetails;
