<template>
  <v-card class="favorites">
    <v-card-title v-if="songCount === 0" primary-title>
      <div class="empty-tips">
        <v-icon class="grey--text text--lighten-1" x-large>library_music</v-icon>
        <p>您尚未收藏任何歌曲</p>
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
import { loadFavoritesList } from '@/api'

export default {
  name: 'Favorites',
  data () {
    return {
      songCount: 0,
      page: parseInt(this.$route.query.p) || 1,
      pageItems: 20,
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
      this.getFavoritesList()
    },

    page () {
      this.$router.push({name: 'favorites', query: {...this.$route.query, p: this.page}})
    }
  },

  methods: {
    getFavoritesList () {
      let offset = this.pageItems * (this.page - 1)
      let ret = loadFavoritesList(offset, this.pageItems)

      this.items = ret.favorites
      this.songCount = ret.songCount
    }
  },

  created () {
    this.getFavoritesList()

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
