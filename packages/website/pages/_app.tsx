/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import React from 'react';
import 'react-vis/dist/style.css';

import '../styles/globals.scss';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}
