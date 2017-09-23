<template>
  <div class="music-playlist" @click.stop>
    <div class="music-playlist-header">
      播放列表
      <span v-show="items.length > 0" class="clear-btn" title="清空" @click.stop="confirmDialog = true">
        <v-icon dark>delete</v-icon>
      </span>
    </div>
    <div v-if="items.length === 0" class="empty-playlist-tips">播放列表是空的</div>
    <ul class="music-playlist-list">
      <li
        v-for="item in items"
        :key="item.id"
        @dblclick="playMusic(item)"
        :class="{current: currentMusicItem && currentMusicItem.id === item.id}"
      >
        <span>{{item.name}}</span>
        <span>{{item.ar.map(e => e.name).join(' / ')}}</span>
        <span>{{item.dt | parseDuration}}</span>
      </li>
    </ul>

    <v-dialog v-model="confirmDialog" persistent>
      <v-card class="grey darken-3 white--text">
        <v-card-text>确认要清空播放列表吗？</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn small round dark error @click.stop="clear">确认</v-btn>
          <v-btn small round dark @click.stop="confirmDialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { eventBus } from '@/utils'
import { loadPlaylist, clearPlaylist } from '@/api'

export default {
  name: 'MusicPlaylist',

  data () {
    return {
      items: [],
      confirmDialog: false,
      currentMusicItem: null
    }
  },

  computed: {
    currentMusicIndex () {
      return this.items.findIndex(item => item.id === this.currentMusicItem.id)
    }
  },

  mounted () {
    eventBus.$on('musicChange', musicItem => {
      this.currentMusicItem = musicItem
    })

    eventBus.$on('playlistChange', palylist => {
      this.items = palylist
    })

    let getNextItem = (playMode, isPrev = false) => {
      let nextMusicItem = this.currentMusicItem
      let step = isPrev ? -1 : 1
      let nextIndex = this.currentMusicIndex + step
      if (playMode === 'list') {
        if (nextIndex >= this.items.length) {
          nextIndex = 0
        } else if (nextIndex < 0) {
          nextIndex = this.items.length - 1
        }
        nextMusicItem = this.items[nextIndex]
      } else if (playMode === 'random') {
        if (this.items.length > 1) {
          nextIndex = Math.floor(Math.random() * (this.items.length - 1))
          let items = [...this.items]
          items.splice(this.currentMusicIndex, 1)
          nextMusicItem = items[nextIndex]
        }
      }

      return nextMusicItem
    }

    eventBus.$on('playPrev', playMode => {
      let nextMusicItem = getNextItem(playMode, true)
      this.playMusic(nextMusicItem)
    })

    eventBus.$on('playNext', playMode => {
      let nextMusicItem = getNextItem(playMode)
      this.playMusic(nextMusicItem)
    })

    this.getPlaylist()
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
    getPlaylist () {
      this.items = loadPlaylist()
    },

    playMusic (musicItem) {
      this.currentMusicItem = musicItem
      eventBus.$emit('musicChange', musicItem)
    },

    clear () {
      clearPlaylist()
      this.confirmDialog = false
    }
  }
}
</script>

<style>
  .music-playlist {
    position: absolute;
    width: 480px;
    height: 300px;
    bottom: 72px;
    right: -1px;
    color: #fff;
    font-size: 16px;
    background: rgba(0, 0, 0, 0.7);
    overflow: hidden;
  }
  .music-playlist .empty-playlist-tips {
    color: #9e9e9e;
    text-align: center;
    margin-top: 100px;
  }
  .music-playlist > .music-playlist-header {
    border-bottom: 1px solid #666;
    padding: 10px 32px;
    margin: 0;
  }
  .music-playlist > .music-playlist-header .clear-btn {
    cursor: pointer;
    float: right;
  }
  .music-playlist > .music-playlist-list {
    max-height: 255px;
    padding: 0;
    margin: 0;
    list-style: none;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .music-playlist > .music-playlist-list li {
    position: relative;
    display: flex;
    padding: 8px 32px;
    border-bottom: 1px solid #444;
    flex-direction: row;
    justify-content: space-between;
    align-items: stretch;
    cursor: pointer;
    font-size: 14px;
  }
  .music-playlist > .music-playlist-list li:hover {
    background: rgba(0, 0, 0, 0.3);
  }
  .music-playlist > .music-playlist-list li.current:before {
    display: inline-block;
    position: absolute;
    content: '▶';
    width: 16px;
    height: 16px;
    left: 8px;
    top: 12px;
    padding: 0;
    margin: 0;
    font: 14px/14px Arial;
    color: #4db6ac;
  }
  .music-playlist > .music-playlist-list li span {
    flex: 2;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow:hidden;
    color: #9e9e9e;
  }
  .music-playlist > .music-playlist-list li span:first-child {
    flex: 3;
    color: #fff;
  }
  .music-playlist > .music-playlist-list li span:last-child {
    flex: 1;
    text-align: right;
  }
</style>
