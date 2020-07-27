<template>
  <nav
    class="navbar sticky lg:h-screen top-0 flex lg:flex-grow-0 lg:flex-col bg-primary text-white"
  >
    <div class="beta">BETA</div>
    <header
      class="logo flex flex-grow md:flex-grow-0 justify-center md:justify-start lg:block py-3 px-4 lg:pt-10 lg:pb-12"
    >
      <nuxt-link to="/" class="flex justify-center lg:block">
        <span class="flex justify-center pr-2 lg:pr-0">
          <img class="h-10 lg:h-12 xl:h-16" src="@/assets/images/logo-white.png" />
        </span>
        <span class="block text-center text-2xl lg:text-2xl xl:text-3xl font-bold leading-relaxed">
          GitTrends
        </span>
      </nuxt-link>
    </header>
    <section class="menu-mobile absolute right-0 py-4 pr-2 text-xl">
      <a class="sm:hidden bg-primary-300 px-3 py-2 rounded" @click="showMenu = true">
        <i class="fas fa-bars"></i>
      </a>
      <div
        class="absolute top-0 right-0 w-screen h-screen bg-primary"
        :class="showMenu ? 'visible z-50' : 'invisible'"
        @click.prevent="void 0"
      >
        <div class="flex flex-grow flex-col items-center justify-center">
          <i class="fas fa-times text-4xl cursor-pointer py-12" @click="showMenu = false"></i>
          <nuxt-link
            v-for="(option, index) in options"
            :key="index"
            class="flex justify-center w-2/4 py-3 text-xl"
            :to="option.url"
            :exact="option.url === '/'"
          >
            {{ option.name.toUpperCase() }}
          </nuxt-link>
        </div>
      </div>
    </section>
    <section
      class="menu options hidden sm:flex lg:flex-col justify-end lg:justify-start lg:content-center flex-grow"
    >
      <nuxt-link
        v-for="(option, index) in options"
        :key="index"
        class="option flex items-center lg:h-16 px-2 lg:px-0 text-lg xl:text-xl leading-none border-solid lg:border-b-2 border-white"
        :class="{ 'lg:border-t-2': index === 0 }"
        :to="option.url"
        :exact="option.url === '/'"
      >
        <i :class="option.class" class="px-2"></i>
        <span class="lg:block hidden">
          {{ option.name }}
        </span>
      </nuxt-link>
    </section>
    <footer class="footer hidden lg:flex justify-center">
      <div class="social bottom-0">
        <a :href="urls.github" target="_blank">
          <i class="fab fa-github"></i>
        </a>
        <a href="#"><i class="fab fa-twitter"></i> </a>
        <a href="mailto:hsborges@facom.ufms.br">
          <i class="fas fa-envelope"></i>
        </a>
      </div>
    </footer>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      showMenu: false,
      urls: {
        github: 'https://www.github.com/hsborges/gittrends.app'
      },
      options: [
        {
          name: 'Home',
          class: 'fas fa-home',
          url: '/'
        },
        {
          name: 'Explorer',
          class: 'fas fa-th',
          url: '/explorer'
        },
        {
          name: 'Compare',
          class: 'fas fa-exchange-alt',
          url: '/compare'
        },
        {
          name: 'About',
          class: 'fas fa-info-circle',
          url: '/about'
        }
      ]
    };
  },
  watch: {
    '$route.path'() {
      window.scrollTo(0, 0);
      this.showMenu = false;
    }
  }
};
</script>

<style lang="stylus" scoped>
div.beta
  @apply: absolute;
  @apply: text-xl bg-secondary-dark font-bold text-white text-center;
  @apply: w-48 -mx-24 pl-10 pt-8;
  transform: rotate(-45deg);

.navbar
  min-width: 15vw;
  .option.nuxt-link-active
    @apply: font-bold text-primary bg-white;
    span
      @apply: inline
  footer > .social > a
    @apply: text-white font-bold text-xl;
    @apply: px-3;

section.menu-mobile .nuxt-link-active
  @apply: text-primary font-bold bg-white rounded-full;

@media (max-width: 1024px)
  .navbar > .options:hover > span
    @apply: hidden;
</style>
