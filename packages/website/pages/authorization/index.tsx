/* eslint-disable react/jsx-no-target-blank */
import React from 'react';
import Cookie from 'universal-cookie';
import { stringify } from 'querystring';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faSmile } from '@fortawesome/free-regular-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

import Layout from '../../layouts/DefaultLayout';

import './index.module.less';

type TAuthorizationResponse = { success?: boolean; login?: string };

const URL = `https://github.com/login/oauth/authorize?${stringify({
  client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
  redirect_uri:
    process.env.NODE_ENV === 'production'
      ? ''
      : `http://${process.env.GITTRENDS_API_HOST}:${process.env.GITTRENDS_API_PORT}/authorize`,
  scope: 'public_repo read:org read:user user:email'
})}`;

function Authorization(props: TAuthorizationResponse): JSX.Element {
  if (props.success) new Cookie().set('dismissed', 1, { maxAge: Number.MAX_SAFE_INTEGER });

  return (
    <Layout>
      <section className="gittrends-authorization">
        <header hidden={props.success}>
          Donate an GitHub access token <FontAwesomeIcon icon={faThumbsUp} />
        </header>
        <section className="feedback-text" hidden={!props.success}>
          Hey <span className="login">{props.login}</span>, we received your token. <br />
          Thank you very much <FontAwesomeIcon icon={faSmile} className="smile" />
        </section>
        <section className="main-text" hidden={props.success}>
          We make thousands of GitHub API requests to keep our database updated. With more tokens we
          can add expand our dataset and speedup the data processing.
        </section>
        <a target="_blank" href={URL} hidden={props.success}>
          <FontAwesomeIcon icon={faGithub} /> Donate
        </a>
        <section className="ps" hidden={props.success}>
          * you can revoke this authorization later on the GitHub website
        </section>

        <footer>
          <img src="/images/dockeregit2.png" alt="" />
        </footer>
      </section>
    </Layout>
  );
}

Authorization.getInitialProps = ({ query }): TAuthorizationResponse => {
  return { success: query.success !== undefined, login: query.login };
};

export default Authorization;
