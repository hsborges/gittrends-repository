/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';

import '../styles/globals.scss';
import 'react-vis/dist/style.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}
