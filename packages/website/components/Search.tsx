import Router from 'next/router';
import React, { useState } from 'react';
import { Input, AutoComplete } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

import fetchProjects from '../hooks/searchProjects';

interface ISearchProps extends React.HTMLAttributes<HTMLElement> {
  placeholder?: string;
  defaultValue?: string;
  size?: SizeType;
  onSearch?: Function;
}

export default function Search(props?: ISearchProps): JSX.Element {
  const [query, setQuery] = useState<string>();
  const { data } = fetchProjects({ query, sortBy: 'stargazers_count', order: 'desc' });
  const { placeholder, defaultValue, size, onSearch, ...aprops } = props;

  return (
    <div {...aprops}>
      <AutoComplete
        options={!query ? [] : data?.repositories.map((repo) => ({ value: repo.name_with_owner }))}
        onSearch={(searchText: string) => searchText && setQuery(searchText)}
        onSelect={(searchText: string) => Router.push({ pathname: `/explorer/${searchText}` })}
        style={{ height: '100%', width: '100%' }}
      >
        <Input.Search
          placeholder={placeholder ?? 'e.g., facebook/react'}
          size={size}
          defaultValue={defaultValue}
          allowClear
          onSearch={(...args) => onSearch(...args)}
        />
      </AutoComplete>
    </div>
  );
}
