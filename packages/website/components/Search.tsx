import {
  Box,
  InputGroup,
  Input,
  InputRightElement,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';
import React, { useState, useRef, useEffect } from 'react';
import { useDetectClickOutside } from 'react-detect-click-outside';

import { useSearch } from '../hooks/api/useSearch';
import styles from './Search.module.scss';

interface ISearchProps extends React.HTMLAttributes<HTMLElement> {
  placeholder?: string;
  defaultValue?: string;
  size?: 'large' | 'normal';
  onSearch?: Function;
  onSelectOption?: Function;
}

export default function Search(props?: ISearchProps): JSX.Element {
  const [query, setQuery] = useState<string>(props.defaultValue);
  const { data } = useSearch({ query, sortBy: 'stargazers_count', order: 'desc', limit: 5 });
  const { placeholder, defaultValue, size, onSearch, ...aprops } = props;

  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>();
  const inputGroupRef = useRef<HTMLDivElement>();
  const menuRef = useDetectClickOutside({ onTriggered: () => setIsOpen(false) });

  useEffect(() => isOpen && !data?.repos?.length && setIsOpen(false), [data, isOpen]);

  return (
    <Menu isOpen={isOpen}>
      <Box {...aprops} className={classnames(aprops.className, styles.autocomplete)} ref={menuRef}>
        <InputGroup
          variant="outline"
          borderColor="var(--primary-color)"
          size={`${size === 'large' ? 'lg' : 'md'}`}
          ref={inputGroupRef}
        >
          <Input
            ref={inputRef}
            placeholder={placeholder}
            focusBorderColor="var(--primary-color)"
            bg="white"
            _hover={{ borderColor: 'var(--primary-color)' }}
            value={query}
            defaultValue={defaultValue}
            onChange={(event) => {
              setQuery(event.target.value);
              if (!isOpen && event.target.value) setIsOpen(true);
            }}
            onFocus={(event) => {
              setIsOpen(!!event.target.value);
            }}
            onKeyPress={(event) => {
              if (event.key === 'Enter' && onSearch) onSearch(query);
            }}
          />
          <InputRightElement>
            <Button
              variant="unstyled"
              color="var(--primary-color)"
              onClick={() => onSearch && onSearch(query)}
            >
              <FontAwesomeIcon icon={faSearch} />
            </Button>
          </InputRightElement>
        </InputGroup>
        <MenuButton className={styles.hidden} />
        <MenuList
          minWidth={inputGroupRef?.current?.offsetWidth ?? 100}
          onFocus={() => inputRef?.current?.focus()}
        >
          {data?.repos.map((repo) => (
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
  );
}
