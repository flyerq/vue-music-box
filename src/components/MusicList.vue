<template>
  <v-list two-line>
    <template v-for="(item, index) in items">
      <v-divider v-if="index !== 0" :inset="true" :key="index"></v-divider>
      <v-list-tile avatar class="list__tile--link" :key="item.id" @dblclick.stop.prevent="playMusic(item)">
        <v-list-tile-avatar>
          <img :src="item.al.picUrl">
        </v-list-tile-avatar>
        <v-btn icon ripple @click.stop.prevent="playMusic(item)" @dblclick.stop>
          <v-icon v-if="currentMusicItem && currentMusicItem.id === item.id" class="teal--text text--lighten-2">play_circle_outline</v-icon>
          <v-icon v-else class="grey--text text--lighten-1">play_circle_outline</v-icon>
        </v-btn>
        <v-list-tile-content>
          <v-list-tile-title>{{item.name}}</v-list-tile-title>
          <v-list-tile-sub-title>
            <span>歌手：{{item.ar.map(e => e.name).join(' / ')}}</span>
            <span class="mx-3">时长：{{item.dt | parseDuration}}</span>
            <span>专辑：{{item.al.name}}</span>
          </v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-btn icon ripple @click.stop.prevent="toggleFavorite(item)" @dblclick.stop>
            <v-icon v-if="item.favorited" class="red--text">favorite</v-icon>
            <v-icon v-else class="grey--text text--lighten-1">favorite_border</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>
    </template>
  </v-list>
</template>

<script>
import { eventBus } from '@/utils'
import { toggleMusicFavorite, addMusicToPlaylist } from '@/api'

export default {
  name: 'MusicList',

  props: ['items'],

  data () {
    return {
      currentMusicItem: null
    }
  },

  mounted () {
    eventBus.$on('musicChange', musicItem => {
      this.currentMusicItem = musicItem
    })
  },

  filters: {
    parseDuration: function (dt) {
      if (!dt) return '00:00'
      let m = parseInt(dt / 1000 / 60).toString().padStart(2, '0')
      let s = parseInt(dt / 1000 % 60).toString().padStart(2, '0')
      return m + ':' + s
    }
  },

  methods: {
    playMusic (musicItem) {
      this.currentMusicItem = musicItem
      addMusicToPlaylist(musicItem)
      eventBus.$emit('musicChange', musicItem)
    },

    toggleFavorite (musicItem) {
      let favorited = toggleMusicFavorite(musicItem)
      eventBus.$emit('favoritesChange', musicItem, favorited)
    }
  }
}
</script>

<style scoped>
.home > :empty:before {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Material Icons';
  display: block;
  content: '\E030';
  color: #eee;
  font-size: 240px;
}
</style>
