<template>
  <v-card class="home">
    <v-card-title primary-title>
      <div v-if="songCount > 0">
        <div class="headline">“{{ $route.query.s }}”的搜索结果</div>
        <span class="grey--text">找到 {{ songCount }} 首歌曲</span>
      </div>

      <div v-else-if="!loading" class="empty-tips">
        <v-icon class="grey--text text--lighten-1" x-large>library_music</v-icon>
        <p v-if="!!$route.query.s">无“{{ $route.query.s }}”相关歌曲</p>
        <p v-else>您尚未搜索任何歌曲</p>
      </div>

      <div v-show="loading" class="loading">
        <v-progress-circular class="teal--text text--lighten-2" indeterminate :size="60"></v-progress-circular>
        <p>加载中...</p>
      </div>
    </v-card-title>

    <music-list :items="items"></music-list>

    <v-card-text v-if="pageTotal > 1" class="pagination-container">
      <v-pagination circle :length.number="pageTotal" v-model="page"></v-pagination>
    </v-card-text>
  </v-card>
</template>

<script>
import MusicList from '@/components/MusicList'
import { eventBus } from '@/utils'
import { fetchSearchList } from '@/api'

export default {
  name: 'Home',
  data () {
    return {
      loading: false,
      songCount: 0,
      page: parseInt(this.$route.query.p) || 1,
      pageItems: 50,
      items: []
    }
  },

  computed: {
    pageTotal () {
      return Math.ceil(this.songCount / this.pageItems)
    }
  },

  watch: {
    $route () {
      this.page = parseInt(this.$route.query.p) || 1
      this.getSearchList()
    },

    page () {
      this.$router.push({name: 'home', query: {...this.$route.query, p: this.page}})
    }
  },

  methods: {
    async getSearchList () {
      let keyword = this.$route.query.s || ''
      this.loading = false
      this.items = []
      this.songCount = 0
      if (!keyword) {
        return
      }

      this.loading = true
      let offset = this.pageItems * (this.page - 1)
      let res = await fetchSearchList(keyword, offset, this.pageItems)
      this.loading = false
      this.items = res.result.songs
      this.songCount = res.result.songCount
    }
  },

  created () {
    this.getSearchList()

    eventBus.$on('favoritesChange', (musicItem, favorited) => {
      this.items = this.items.map(item => {
        if (item.id === musicItem.id) {
          item.favorited = favorited
        }
        return item
      })
    })
  },

  components: {
    MusicList
  }
}
</script>

<style>
.loading, .empty-tips {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.loading > p, .empty-tips > p {
  margin-top: 10px;
  font-size: 16px;
  color: #555;
}

.application--light .pagination__item--active {
  background: #4db6ac;
}

.pagination-container {
  max-width: 90%;
  text-align: center;
  margin: 0 auto;
}

.pagination-container .pagination {
  overflow: hidden;
}
</style>
