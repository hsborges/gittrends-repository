import axios from 'axios';

export default axios.create({ baseURL: process.env.NEXT_PUBLIC_GITTRENDS_WEBSITE_DATASOURCE_URL });
