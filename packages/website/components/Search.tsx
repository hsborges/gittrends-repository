import React from 'react';
import { Input } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

interface ISearchProps {
  placeholder?: string;
  defaultValue?: string;
  size?: SizeType;
  className?: string;
  onSearch?: Function;
}

export default function Search(props?: ISearchProps): JSX.Element {
  return (
    <Input.Search
      placeholder={props.placeholder ?? 'e.g., facebook/react'}
      size={props.size}
      defaultValue={props.defaultValue}
      allowClear
      className={props.className}
      onSearch={(...args) => props?.onSearch(...args)}
    />
  );
}
