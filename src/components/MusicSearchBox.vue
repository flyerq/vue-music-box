<template>
  <v-text-field
    class="music-search-box"
    label="搜索歌曲"
    append-icon="search"
    type="search"
    dark
    single-line
    hide-details
    v-model="keyword"
    :append-icon-cb="search"
    @keypress.enter="search"
  ></v-text-field>
</template>

<script>
export default {
  name: 'MusicSearchBox',
  data () {
    return {
      keyword: this.$route.query.s || ''
    }
  },

  watch: {
    $route () {
      if (this.$route.name === 'home') {
        this.keyword = this.$route.query.s || ''
      }
    }
  },

  methods: {
    search () {
      this.$router.push({name: 'home', query: {s: this.keyword}})
    }
  }
}
</script>

<style>
.music-search-box .input-group__details:after {
  background-color: rgba(255,255,255,0.32) !important;
}
.music-search-box.input-group.input-group--focused .input-group__append-icon {
  color: inherit !important;
}
.music-search-box.input-group {
  padding: 0;
  margin-right: 8px;
}
.music-search-box.input-group label {
  top: 0;
}
</style>
