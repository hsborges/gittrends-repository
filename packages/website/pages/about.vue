<template>
  <div class="container flex flex-col flex-grow items-center p-4 md:p-16">
    <Request ref="modal" />
    <div class="w-full lg:w-4/5">
      <article>
        <h1>What is GitTrends.app?</h1>
        <p>
          GitTrends is a tool created to support developers, project maintainers and software
          engineering researchers by providing useful insights on popular open source projects
          hosted on GitHub.
        </p>
        <p>
          The information provided here is based on mining software research and you can get
          detailed information in the
          <a href="#references">references</a> bellow.
        </p>
      </article>
      <article>
        <h1>How it works?</h1>
        <p>
          To keep our database updated we have a web service running on background making millions
          of requests per hour to GitHub service API. The data obtained from these requests are
          stored in a non-relational database, while is also processed, analyzed, and pushed to this
          website.
        </p>
        <p>
          As GitHub limits the number of requests to their servers, we need as many as possible
          GitHub access tokens to keep our services running and our website aways updated. Thus, if
          you liked this project, please consider donating an access token by
          <router-link to="/authorization"> cliking here</router-link>.
        </p>
      </article>
      <article>
        <h1>Why is my project not listed in this tool?</h1>
        <p>
          Although GitHub hosts millions of repositories, GitTrends only monitor popular
          repositories (i.e., those ones with a large number of stars). If your repository is not
          indexed, you can
          <a class="cursor-pointer" @click.prevent="$refs.modal.show()">
            click here
          </a>
          or send an email to us requesting its inclusion (please, tell us why it would be useful
          for you).
        </p>
      </article>
      <article>
        <h1>Who is maintaining this tool?</h1>
        <div class="me flex flex-col md:flex-row py-8 min-h-32 md:h-56">
          <div class="picture flex flex-grow-0 justify-center">
            <img src="@/assets/images/hudson.jpg" class="h-32 md:h-full" />
          </div>
          <div class="description flex flex-grow flex-col text-base md:text-lg pt-8 md:pt-0">
            <span class="name text-lg md:text-xl font-bold">
              Hudson Silva Borges
            </span>
            <span>
              Assistant professor at
              <abbr title="Faculty of Computer Science">FACOM</abbr>/<abbr
                title="Federal University of Mato Grosso do Sul"
                >UFMS</abbr
              >, Brazil.
            </span>
            <span>
              Email: hsborges [a] facom.ufms.br
            </span>
          </div>
        </div>
      </article>
      <article id="references">
        <h1>Academic Publications</h1>
        <ul class="reference-list">
          <li v-for="(reference, index) in references" :key="index" class="py-3">
            <a :href="reference.pdf" target="_blank">
              <i class="fas fa-file-pdf text-red-500 pr-2"></i>
            </a>
            <span>{{ reference.authors }}. </span>
            <span class="font-bold">{{ reference.title }}. </span>
            <span>{{ reference.misc }}. </span>
          </li>
        </ul>
      </article>
    </div>
  </div>
</template>

<script>
import Request from '@/components/RequestRepositoryForm.vue';

export default {
  components: { Request },
  data() {
    return {
      references: [
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
      ]
    };
  }
};
</script>

<style lang="stylus" scoped>
.container
  @apply: text-lg text-justify;
  a
    @apply: text-primary font-bold underline;
  article
    @apply: pb-8;
    h1
      @apply: text-2xl text-primary font-bold;
      @apply: border-b border-solid border-primary;
    p
      @apply: py-2;

@media (max-width: 640px)
  .container
    @apply: text-base text-justify;
    h1
      @apply: text-xl;
</style>
