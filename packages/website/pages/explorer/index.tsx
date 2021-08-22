import React, { useEffect, useState } from 'react';
import Router from 'next/router';
import pickBy from 'lodash/pickBy';
import isEqual from 'lodash/isEqual';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Select, Stat, StatLabel, StatNumber } from '@chakra-ui/react';
import {
  usePagination,
  Pagination,
  PaginationContainer,
  PaginationPrevious,
  PaginationNext,
  PaginationPageGroup,
  PaginationPage,
  PaginationSeparator
} from '@ajna/pagination';

import DefaultLayout from '../../layouts/DefaultLayout';
import ServerError from '../../components/ServerError';
import Search from '../../components/Search';
import Card from '../../components/RepositoryCard';
import fetchProjects, { ISearch } from '../../hooks/searchProjects';

import styles from './index.module.scss';

function Explorer(props: ISearch): JSX.Element {
  const container = React.createRef<HTMLDivElement>();
  const [pageSize, setPageSize] = useState<number>(props.limit ?? 24);
  const [page, setPage] = useState((props.offset ?? 0) / pageSize + 1);
  const [query, setQuery] = useState<ISearch>({ limit: pageSize, ...props });

  const { data, isLoading, isError } = fetchProjects(query);

  useEffect(() => {
    setQuery({ ...query, offset: (Number(page) - 1) * Number(pageSize), limit: Number(pageSize) });
    setPaginatorPageSize(Number(pageSize));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  useEffect(() => {
    Router.push({ query: pickBy(query, (v) => v) });
  }, [query]);

  // useEffect(() => {
  //   Router.events.on('routeChangeComplete', (newUrl) => {
  //     const parsedURL = new urlParse(newUrl);
  //     if (!parsedURL.query && Router.pathname == parsedURL.pathname) setQuery({ limit: pageSize });
  //   });
  // });

  const {
    pages,
    pagesCount,
    currentPage,
    setCurrentPage,
    isDisabled,
    setPageSize: setPaginatorPageSize
  } = usePagination({
    total: data?.meta?.repositories_count ?? 0,
    initialState: { pageSize, currentPage: page },
    limits: { inner: 2, outer: 2 }
  });

  const updateQuery = (data, concat = false) => {
    if (isEqual({ ...query, ...data }, query)) return;
    setQuery({ ...query, offset: concat ? query.offset : 0, ...data });
  };

  return (
    <DefaultLayout className={styles['explorer-page']}>
      <section ref={container}>
        <header className={styles.header}>
          <div className={styles.select}>
            <Select
              defaultValue={query.language}
              variant="outline"
              value={query.language}
              onChange={(event) => updateQuery({ language: event.target.value })}
              borderColor="var(--primary-color)"
              focusBorderColor="var(--primary-color)"
              iconColor="var(--primary-color)"
              _hover={{ borderColor: 'var(--primary-color)' }}
            >
              <option key="all" value="" selected={!query.language}>
                All
              </option>
              {Object.entries(data?.meta.languages_count ?? {}).map((entry) => (
                <option
                  key={entry[0]}
                  value={entry[0]}
                  selected={query.language === entry[0]}
                >{`${entry[0]} (${entry[1]})`}</option>
              ))}
            </Select>
          </div>
          <Stat className={styles.statistic}>
            <StatLabel>Total Repositories</StatLabel>
            <StatNumber>{data?.meta.repositories_count}</StatNumber>
          </Stat>

          <Search
            className={styles.search}
            defaultValue={query.query}
            onSearch={(value: string) => updateQuery({ query: value })}
          />
        </header>
        <section
          className={styles.content}
          hidden={data?.meta.repositories_count === 0 || isLoading || isError}
          ref={container}
        >
          {data?.repositories.map((repo) => (
            <Card key={repo.name_with_owner} repository={repo.name_with_owner} className="card" />
          ))}
        </section>
        <section
          className={styles.content}
          hidden={data?.meta.repositories_count > 0 || isLoading || isError}
        >
          {/* <Empty style={{ fontSize: '1.5em' }} /> */}
        </section>
        <section className={styles.content} hidden={!isError}>
          <ServerError style={{ fontSize: '1.5em' }} />
        </section>
        <footer className={styles.footer}>
          <Pagination
            pagesCount={pagesCount}
            currentPage={currentPage}
            isDisabled={isDisabled}
            onPageChange={(page) => {
              container.current.parentElement.parentElement.scrollTo(0, 0);
              setPage(page);
              setCurrentPage(page);
            }}
          >
            <PaginationContainer>
              <PaginationPrevious border="1px solid var(--primary-color)" bg="none" mr={1}>
                <FontAwesomeIcon icon={faChevronLeft} />
              </PaginationPrevious>
              <PaginationPageGroup
                isInline
                align="center"
                separator={<PaginationSeparator isDisabled jumpSize={10} />}
              >
                {pages.map((page) => (
                  <PaginationPage
                    key={`pagination_page_${page}`}
                    page={page}
                    minWidth={50}
                    border="1px solid var(--primary-color)"
                    bg="none"
                    _current={{
                      bg: 'var(--primary-color)',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                ))}
              </PaginationPageGroup>
              <PaginationNext border="1px solid var(--primary-color)" bg="none" ml={1}>
                <FontAwesomeIcon icon={faChevronRight} />
              </PaginationNext>
            </PaginationContainer>
          </Pagination>
          <Select
            width={125}
            iconColor="var(--primary-color)"
            borderColor="var(--primary-color)"
            _hover={{ borderColor: 'var(--primary-color)' }}
            focusBorderColor="var(--primary-color)"
            marginLeft="10px"
            padding={0}
            variant="filled"
            bg="none"
            onChange={(event) => setPageSize(Number(event.currentTarget.value))}
          >
            {[12, 24, 48, 96].map((size) => (
              <option value={size} selected={Number(pageSize) === size}>
                {size} / page
              </option>
            ))}
          </Select>
        </footer>
      </section>
    </DefaultLayout>
  );
}

Explorer.getInitialProps = ({ query }): ISearch => {
  return { query: query.query, language: query.language, limit: query.limit, offset: query.offset };
};

export default Explorer;
