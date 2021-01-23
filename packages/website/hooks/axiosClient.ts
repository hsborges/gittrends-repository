import axios from 'axios';

const prod = process.env.NODE_ENV === 'production';
const devHost = process.env.GITTRENDS_API_HOST ?? '127.0.0.1';
const devPort = process.env.GITTRENDS_API_PORT ?? 8888;

export default axios.create({ baseURL: prod ? '/api' : `http://${devHost}:${devPort}` });
