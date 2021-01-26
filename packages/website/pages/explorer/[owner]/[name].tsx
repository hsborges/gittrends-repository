import React from 'react';
import Link from 'next/link';
import { Anchor, Avatar, Breadcrumb, Tag } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

import DefaultLayout from '../../../layouts/DefaultLayout';
import Divider from '../../../components/explorer/divider';
import OverviewSection from '../../../components/explorer/overview-section';
import PopularitySection from '../../../components/explorer/popularity-section';

import fetchTags from '../../../hooks/fetchTags';
import fetchRepository from '../../../hooks/fetchProject';
import fetchStargazers from '../../../hooks/fetchStargazers';

import './[name].module.less';

function ProjectDetails(props: { name_with_owner: string }): JSX.Element {
  const { repository } = fetchRepository({ name_with_owner: props.name_with_owner });
  const { timeseries, first, last } = fetchStargazers({ name_with_owner: props.name_with_owner });
  const { tags } = fetchTags({ name_with_owner: props.name_with_owner });

  return (
    <DefaultLayout id="project-explorer" className="overflow-hidden" showSearch>
      <section id="project-explorer-top" className="project-explorer">
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
            <Breadcrumb.Item>
              <Link href="/explorer" as="/explorer" passHref>
                <a>
                  <span>Explorer</span>
                </a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <span>{repository?.name}</span>
            </Breadcrumb.Item>
          </Breadcrumb>
          <Anchor
            className="anchor"
            affix
            offsetTop={10}
            getContainer={(): HTMLElement => document.querySelector('#project-explorer')}
            onChange={(anchor) =>
              document
                .getElementById('project-explorer-top')
                .querySelector('.breadcrumb')
                .classList[anchor ? 'add' : 'remove']('hidden')
            }
          >
            <Anchor.Link href="#project-explorer-top" title="Top" />
            <Anchor.Link href="#overview" title="Overview" />
            {timeseries ? <Anchor.Link href="#popularity" title="Popularity" /> : ''}
          </Anchor>
        </header>

        <section className="content">
          <section className="title">
            <div>
              <Avatar src={repository?.open_graph_image_url} size="large" />
              <span>{repository?.name_with_owner}</span>
            </div>
            <span className="description">{repository?.description}</span>
            <span className="topics" hidden={!repository?.repository_topics}>
              {repository?.repository_topics?.map((topic, index) => (
                <Tag key={index} className="topic">
                  {topic}
                </Tag>
              ))}
            </span>
          </section>

          <Divider id="overview" title="Overview" className="divider" />
          <OverviewSection repository={repository} />

          {timeseries && <Divider id="popularity" title="Popularity" className="divider" />}
          {timeseries && (
            <PopularitySection timeseries={timeseries} first={first} last={last} tags={tags} />
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
