import React from 'react';
import { Input } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

interface ISearchProps extends React.HTMLAttributes<HTMLElement> {
  placeholder?: string;
  defaultValue?: string;
  size?: SizeType;
  onSearch?: Function;
}

export default function Search(props?: ISearchProps): JSX.Element {
  return (
    <Input.Search
      {...props}
      placeholder={props.placeholder ?? 'e.g., facebook/react'}
      size={props.size}
      defaultValue={props.defaultValue}
      allowClear
      onSearch={(...args) => props?.onSearch(...args)}
    />
  );
}
