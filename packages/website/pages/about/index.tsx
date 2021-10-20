import { faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

import Layout from '../../layouts/DefaultLayout';
import styles from './index.module.scss';

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
    misc: 'In 12th International Conference on Predictive Models and Data Analytics in Software Engineering (PROMISE), p. 1-10, 2016',
    pdf: 'http://arxiv.org/pdf/1607.04342v1.pdf'
  },
  {
    authors: 'Hudson Borges, Andre Hora, Marco Tulio Valente',
    title: 'Understanding the Factors that Impact the Popularity of GitHub Repositories',
    misc: 'In 32nd IEEE International Conference on Software Maintenance and Evolution (ICSME), pages 334-344, 2016',
    pdf: 'http://www.dcc.ufmg.br/~mtov/pub/2016-icsme'
  }
];

export default function Info(): JSX.Element {
  return (
    <Layout>
      <section className={styles.about}>
        <article>
          <h2>What is GitTrends.app?</h2>
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
          <h2>How it works?</h2>
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
            <a> cliking here</a>.
          </p>
        </article>
        <article>
          <h2>Why is my project not listed in this tool?</h2>
          <p>
            Although GitHub hosts millions of repositories, GitTrends only monitor popular
            repositories (i.e., those ones with a large number of stars). If your repository is not
            indexed, you can <a> click here </a> or send an email to us requesting its inclusion
            (please, tell us why it would be useful for you).
          </p>
        </article>
        <article>
          <h2>Who is maintaining?</h2>
          <section>
            <div className={styles.maintainer}>
              <img className={styles.picture} src="/images/hudson.jpg" alt="" />
              <span className={styles.description}>
                <span> Hudson Silva Borges </span>
                <span>
                  Assistant professor at
                  <abbr title="Faculty of Computer Science">FACOM</abbr>/
                  <abbr title="Federal University of Mato Grosso do Sul">UFMS</abbr>, Brazil.
                </span>
                <span> Email: hsborges [a] facom.ufms.br </span>
              </span>
            </div>
          </section>
        </article>
        <article id="references">
          <h2>Academic Publications</h2>
          <dl>
            {references.map((reference, index) => (
              <dd key={index} className={styles.reference}>
                <a href={reference.pdf} target="_blank" rel="noreferrer" className={styles.pdf}>
                  <FontAwesomeIcon icon={faFilePdf} />
                </a>
                <span className={styles.authors}>{reference.authors}.</span>
                <span className={styles.title}>{reference.title}.</span>
                <span className={styles.misc}>{reference.misc}.</span>
              </dd>
            ))}
          </dl>
        </article>
      </section>
    </Layout>
  );
}
