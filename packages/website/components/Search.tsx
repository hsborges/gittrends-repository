import Router from 'next/router';
import React, { useState, useRef } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import classnames from 'classnames';
import { Box, InputGroup, Input, InputRightElement, Button } from '@chakra-ui/react';
import { Menu, MenuButton, MenuList, MenuItem, useControllableState } from '@chakra-ui/react';
import { useDetectClickOutside } from 'react-detect-click-outside';

import fetchProjects from '../hooks/searchProjects';
import styles from './Search.module.scss';
import { useEffect } from 'react';

interface ISearchProps extends React.HTMLAttributes<HTMLElement> {
  placeholder?: string;
  defaultValue?: string;
  size?: 'large' | 'normal';
  onSearch?: Function;
  onSelectOption?: Function;
}

export default function Search(props?: ISearchProps): JSX.Element {
  const [query, setQuery] = useState<string>(props.defaultValue);
  const { data } = fetchProjects({ query, sortBy: 'stargazers_count', order: 'desc' });
  const { placeholder, defaultValue, size, onSearch, ...aprops } = props;

  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>();
  const inputGroupRef = useRef<HTMLDivElement>();
  const menuRef = useDetectClickOutside({ onTriggered: () => setIsOpen(false) });

  useEffect(() => isOpen && !data?.repositories?.length && setIsOpen(false), [data]);

  return (
    <Menu isOpen={isOpen}>
      <Box {...aprops} className={classnames(aprops.className, styles.autocomplete)} ref={menuRef}>
        <InputGroup
          variant="outline"
          borderColor="var(--primary-color)"
          size={`${props.size === 'large' ? 'lg' : 'md'}`}
          ref={inputGroupRef}
        >
          <Input
            ref={inputRef}
            placeholder={props.placeholder}
            focusBorderColor="var(--primary-color)"
            bg="white"
            _hover={{ borderColor: 'var(--primary-color)' }}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              if (!isOpen && event.target.value) setIsOpen(true);
            }}
            onFocus={(event) => {
              setIsOpen(!!event.target.value);
            }}
            onKeyPress={(event) => {
              if (event.key === 'Enter' && props.onSearch) props?.onSearch(query);
            }}
          />
          <InputRightElement>
            <Button
              variant="unstyled"
              color="var(--primary-color)"
              onClick={() => props.onSearch && props.onSearch(query)}
            >
              <SearchIcon />
            </Button>
          </InputRightElement>
        </InputGroup>
        <MenuButton className={styles.hidden} />
        <MenuList
          minWidth={inputGroupRef?.current?.offsetWidth ?? 100}
          onFocus={() => inputRef?.current?.focus()}
        >
          {data?.repositories.slice(0, 5).map((repo) => (
            <MenuItem
              key={`recommendation_${repo?.name_with_owner}`}
              onClick={() => {
                setQuery(repo?.name_with_owner);
                setIsOpen(false);
                if (props.onSelectOption) props.onSelectOption(repo?.name_with_owner);
              }}
            >
              {repo?.name_with_owner}
            </MenuItem>
          ))}
        </MenuList>
      </Box>
    </Menu>
    // <Autocomplete
    //   {...aprops}
    //   freeSolo
    //   options={data?.repositories.map((repo) => repo?.name_with_owner) || []}
    //   disableClearable
    //   className={classnames(aprops.className, styles.search)}
    //   renderInput={({ InputLabelProps, InputProps, ...params }) => (
    //     <Paper
    //       ref={InputProps.ref}
    //       variant="outlined"
    //       className={classnames([classes.root, { [classes.large]: props.size === 'large' }])}
    //       style={{ width: '100%' }}
    //     >
    //       <InputBase {...params} {...InputProps} fullWidth />
    //       <IconButton className={classes.iconButton}>
    //         <SearchIcon />
    //       </IconButton>
    //     </Paper>
    //   )}
    //   onChange={(_, value, event) => {
    //     if (event === 'select-option') Router.push({ pathname: `/explorer/${value}` });
    //   }}
    // />
    /* <AutoComplete
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
      </AutoComplete> */
  );
}
