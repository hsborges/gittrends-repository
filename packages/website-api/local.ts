/*
 *  Author: Hudson S. Borges
 */
import { configureApp } from './app';

const port = process.env.PORT || 3000;
configureApp().listen(port, () => console.log(`Listening on port ${port}`));
