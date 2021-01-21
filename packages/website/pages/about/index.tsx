import React from 'react';
import Link from 'next/link';
import { Avatar } from 'antd';
import Layout from '../../layouts/DefaultLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';

import './index.module.less';

const references: Record<string, string>[] = [
  {
    authors: 'Hudson Borges, Rodrigo Brito, Marco Tulio Valente',
    title: 'Beyond Textual Issues: Understanding the Usage and Impact of GitHub Reactions',
    misc: 'In 33rd Brazilian Symposium on Software Engineering (SBES), pages 1-10, 2019',
    pdf: 'https://homepages.dcc.ufmg.br/~mtov/pub/2019-sbes.pdf'
  },
  {
    authors: 'Hudson Borges, Marco Tulio Valente',
    title: 'How do Developers Promote Open Source Projects?',
    misc: 'IEEE Computer, vol. 52, issue 8, pages 27-33, 2019',
    pdf: 'http://www.dcc.ufmg.br/~mtov/pub/2018-ieee-computer.pdf'
  },
  {
    authors: 'Hudson Borges, Andre Hora, Marco Tulio Valente',
    title: 'Predicting the Popularity of GitHub Repositories',
    misc:
      'In 12th International Conference on Predictive Models and Data Analytics in Software Engineering (PROMISE), p. 1-10, 2016',
    pdf: 'http://arxiv.org/pdf/1607.04342v1.pdf'
  },
  {
    authors: 'Hudson Borges, Andre Hora, Marco Tulio Valente',
    title: 'Understanding the Factors that Impact the Popularity of GitHub Repositories',
    misc:
      'In 32nd IEEE International Conference on Software Maintenance and Evolution (ICSME), pages 334-344, 2016',
    pdf: 'http://www.dcc.ufmg.br/~mtov/pub/2016-icsme'
  }
];

export default function Info(): JSX.Element {
  return (
    <Layout>
      <section className="about">
        <article>
          <h1>What is GitTrends.app?</h1>
          <p>
            GitTrends is a tool created to support developers, project maintainers and software
            engineering researchers by providing useful insights on popular open source projects
            hosted on GitHub.
          </p>
          <p>
            The information provided here is based on mining software research and you can get
            detailed information in the <a href="#references">references</a> bellow.
          </p>
        </article>
        <article>
          <h1>How it works?</h1>
          <p>
            To keep our database updated we have a web service running on background making millions
            of requests per hour to GitHub service API. The data obtained from these requests are
            stored in a non-relational database, while is also processed, analyzed, and pushed to
            this website.
          </p>
          <p>
            As GitHub limits the number of requests to their servers, we need as many as possible
            GitHub access tokens to keep our services running and our website aways updated. Thus,
            if you liked this project, please consider donating an access token by
            <Link href="/authorization" passHref>
              <a> cliking here</a>
            </Link>
            .
          </p>
        </article>
        <article>
          <h1>Why is my project not listed in this tool?</h1>
          <p>
            Although GitHub hosts millions of repositories, GitTrends only monitor popular
            repositories (i.e., those ones with a large number of stars). If your repository is not
            indexed, you can
            <a className=""> click here </a>
            or send an email to us requesting its inclusion (please, tell us why it would be useful
            for you).
          </p>
        </article>
        <article>
          <h1>Who is maintaining this tool?</h1>
          <p className="me flex flex-col md:flex-row py-8 min-h-32 md:h-56">
            <div className="picture">
              <Avatar shape="square" size={196} src="/images/hudson.jpg" alt="" />
            </div>
            <div className="description">
              <span className="name text-lg md:text-xl font-bold"> Hudson Silva Borges </span>
              <span>
                Assistant professor at
                <abbr title="Faculty of Computer Science">FACOM</abbr>/
                <abbr title="Federal University of Mato Grosso do Sul">UFMS</abbr>, Brazil.
              </span>
              <span> Email: hsborges [a] facom.ufms.br </span>
            </div>
          </p>
        </article>
        <article id="references">
          <h1>Academic Publications</h1>
          <dl>
            {references.map((reference, index) => (
              <dd key={index} className="reference">
                <a href={reference.pdf} target="_blank" rel="noreferrer" className="pdf">
                  <FontAwesomeIcon icon={faFilePdf} />
                </a>
                <span className="authors">{reference.authors}.</span>
                <span className="title">{reference.title}.</span>
                <span className="misc">{reference.misc}.</span>
              </dd>
            ))}
          </dl>
        </article>
      </section>
    </Layout>
  );
}
