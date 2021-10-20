import { Grid, Avatar, Tag, TagLabel, TagLeftIcon } from '@chakra-ui/react';
import { faStar, faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';
import Link from 'next/link';
import numeral from 'numeral';
import React from 'react';

import { BaseRepository } from '@gittrends/website-api/database/types.d';

import styles from './RepositoryCard.module.scss';

const stats: { field: string; icon: any }[] = [
  { field: 'stargazers_count', icon: faStar },
  { field: 'forks_count', icon: faCodeBranch }
];

interface RepositoryCardProps extends React.HTMLAttributes<HTMLElement> {
  repository: BaseRepository;
}

export default function RepositoryCard(props: RepositoryCardProps): JSX.Element {
  const { repository, ...cardProps } = props;

  return (
    <Grid {...cardProps} className={classnames(styles['repository-card'], cardProps.className)}>
      <Link href={`/explorer/${repository.name_with_owner}`} passHref>
        <a>
          <Grid className={styles['card-header']}>
            <Avatar
              src={repository.open_graph_image_url}
              className={styles['card-header-avatar']}
            />
            <span className={styles['card-header-title']}>{repository.name}</span>
          </Grid>
          <Grid className={styles.stats}>
            {stats.map((stat) => (
              <Tag key={stat.field} className={styles.stat} bg="transparent">
                <TagLeftIcon className={styles['stat-icon']}>
                  <FontAwesomeIcon icon={stat.icon} />
                </TagLeftIcon>
                <TagLabel color="var(--text-color-secondary)">
                  {numeral(repository[stat.field]).format('0,0')}
                </TagLabel>
              </Tag>
            ))}
          </Grid>
          <Grid className={styles.views}>
            <span className={styles.description}>
              {repository.description || '<no_description_available>'}
            </span>
          </Grid>
        </a>
      </Link>
    </Grid>
  );
}
