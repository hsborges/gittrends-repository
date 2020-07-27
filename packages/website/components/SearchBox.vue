<template>
  <div
    class="flex w-full border border-secondary-200 rounded appearance-none leading-normal z-auto"
  >
    <input
      :id="id"
      v-model="query"
      type="text"
      class="flex flex-grow overflow-hidden focus:outline-none"
      :placeholder="placeholder"
      @keypress.enter="search"
    />
    <a class="flex cursor-pointer text-sm px-1 text-secondary-400 hover:text-secondary">
      <i class="fas fa-search py-1" @click="search"></i>
    </a>
    <a
      v-if="showClear"
      class="flex cursor-pointer text-sm pr-1 sm:pr-2 text-secondary-400 hover:text-secondary"
    >
      <i class="fas fa-times py-1" @click="clear"></i>
    </a>
  </div>
</template>

<script>
export default {
  props: {
    id: { type: String, default: 'search' },
    placeholder: { type: String, default: 'e.g., twbs/bootstrap' },
    showClear: { type: Boolean, default: false }
  },
  data() {
    return { query: null };
  },
  methods: {
    search() {
      this.$emit('search', this.query);
    },
    clear() {
      this.query = null;
      this.$emit('clear');
    }
  }
};
</script>
