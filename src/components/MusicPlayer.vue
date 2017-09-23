<template>
  <div class="music-player">
    <audio
      v-if="currentMusic"
      :src="currentMusic.url"
      ref="audio"
      autoplay
      @playing="paused = false"
      @pause="paused = true"
      @timeupdate="updateTime"
      @ended="playNext"
    ></audio>

    <div class="cover">
      <img v-if="currentMusicItem" :src="currentMusicItem.al.picUrl">
    </div>
    <div class="actions-before">
      <v-btn fab dark small class="teal lighten-2" @click="playPrev">
        <v-icon dark>skip_previous</v-icon>
      </v-btn>
      <v-btn fab dark small class="teal lighten-2" @click="togglePlay">
        <v-icon dark v-if="!paused">pause</v-icon>
        <v-icon dark v-else>play_arrow</v-icon>
      </v-btn>
      <v-btn fab dark small class="teal lighten-2" @click="playNext">
        <v-icon dark>skip_next</v-icon>
      </v-btn>
    </div>
    <div class="progress">
      <p>
        <span v-if="currentMusicItem">
          <span>{{currentMusicItem.name}}</span>
          - <span class="grey--text">{{currentMusicItem.ar.map(e => e.name).join(' / ')}}</span>
        </span>
        <span v-else>
          <span class="grey--text">尚未播放歌曲</span>
        </span>
        <span v-if="currentMusicItem" class="duration">
          <span>{{currentTime | parseDuration}}</span>
          / <span class="grey--text">{{currentMusicItem.dt / 1000 | parseDuration}}</span>
        </span>
      </p>
      <v-slider dark v-model="progress" @input="setTime" :disabled="!currentMusic"></v-slider>
    </div>
    <div class="actions-after">
      <v-btn icon dark @click="toggleFavorite(currentMusicItem)">
        <v-icon v-if="currentMusicItem && currentMusicItem.favorited" class="red--text">favorite</v-icon>
        <v-icon v-else>favorite_border</v-icon>
      </v-btn>
      <v-btn icon dark @click.stop="switchPlayMode">
        <v-icon>{{playModeIcon[playMode]}}</v-icon>
      </v-btn>
      <v-btn icon dark @click.stop="showVolumeControls = !showVolumeControls">
        <v-icon v-if="volume > 0">volume_up</v-icon>
        <v-icon v-else>volume_off</v-icon>
      </v-btn>
      <v-btn icon dark @click.stop="showPlaylist = !showPlaylist">
        <v-icon>queue_music</v-icon>
      </v-btn>

      <div v-show="showVolumeControls" class="volume-controls" @click.stop>
        <v-slider dark :prepend-icon="volume > 0 ? 'volume_up' : 'volume_off'" v-model="volume"></v-slider>
      </div>

      <music-playlist v-show="showPlaylist"></music-playlist>
    </div>
  </div>
</template>

<script>
import MusicPlaylist from '@/components/MusicPlaylist'
import { eventBus } from '@/utils'
import { fetchMusic, toggleMusicFavorite } from '@/api'

export default {
  name: 'MusicPlayer',

  components: {
    MusicPlaylist
  },

  data () {
    return {
      paused: true,
      volume: 100,
      progress: 0,
      currentTime: 0,
      currentMusic: null,
      currentMusicItem: null,
      showPlaylist: false,
      showVolumeControls: false,
      playMode: 'list',
      playModeIcon: {
        list: 'playlist_play',
        random: 'shuffle',
        repeatOne: 'repeat_one'
      }
    }
  },

  watch: {
    volume () {
      if (this.currentMusic) {
        this.$refs.audio.volume = this.volume / 100
      }
    }
  },

  mounted () {
    eventBus.$on('musicChange', musicItem => {
      this.currentMusicItem = musicItem
      this.getMusic(musicItem)
    })

    eventBus.$on('favoritesChange', (musicItem, favorited) => {
      if (this.currentMusicItem && this.currentMusicItem.id === musicItem.id) {
        this.currentMusicItem.favorited = favorited
      }
    })

    document.addEventListener('click', () => {
      this.showVolumeControls = false
      this.showPlaylist = false
    })
  },

  filters: {
    parseDuration: function (dt) {
      if (!dt) return '00:00'
      let m = parseInt(dt / 60).toString().padStart(2, '0')
      let s = parseInt(dt % 60).toString().padStart(2, '0')
      return m + ':' + s
    }
  },

  methods: {
    async getMusic (musicItem) {
      this.currentMusic = await fetchMusic(musicItem.id)
    },

    switchPlayMode () {
      if (this.playMode === 'list') {
        this.playMode = 'random'
      } else if (this.playMode === 'random') {
        this.playMode = 'repeatOne'
      } else if (this.playMode === 'repeatOne') {
        this.playMode = 'list'
      }
    },

    togglePlay () {
      if (!this.$refs.audio) {
        return
      }

      if (this.$refs.audio.paused) {
        this.$refs.audio.play()
        this.paused = false
      } else {
        this.$refs.audio.pause()
        this.paused = true
      }
    },

    playPrev () {
      eventBus.$emit('playPrev', this.playMode)
    },

    playNext () {
      eventBus.$emit('playNext', this.playMode)
    },

    updateTime () {
      let audio = this.$refs.audio
      this.currentTime = audio.currentTime
      this.progress = parseInt(audio.currentTime / audio.duration * 100)
    },

    setTime () {
      let audio = this.$refs.audio
      if (isNaN(this.progress / 100 * audio.duration)) {
        return
      }

      audio.currentTime = this.progress / 100 * audio.duration
    },

    toggleFavorite (musicItem) {
      if (!musicItem) return

      let favorited = toggleMusicFavorite(musicItem)
      eventBus.$emit('favoritesChange', musicItem, favorited)
    }
  }
}
</script>

<style>
  .music-player {
    position: relative;
    display: flex;
    height: 72px;
    width: 100%;
    margin: 1px !important;
    flex-direction: row;
    justify-content: flex-start;
    align-items: stretch;
  }

  .music-player > .cover {
    height: 72px;
    width: 72px;
    background: #9e9e9e;
  }
  .music-player > .cover > img {
    width: 100%;
    height: auto;
  }

  .music-player > .actions-before,.music-player > .actions-after {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
  }

  .music-player > .progress {
    flex: 6;
    padding: 8px 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: stretch;
  }
  .music-player .input-group--slider,.progress > p {
    padding: 0;
    margin: 0;
    color: #fff;
  }
  .music-player > .progress .duration {
    float: right;
  }
  .music-player .input-group--slider.input-group--dirty .slider__thumb {
    background: #4db6ac;
    border-color: #4db6ac;
  }
  .music-player .input-group--slider:not(.input-group--disabled).input-group--dirty .slider__track-fill {
    background: #4db6ac;
  }

  .music-player .volume-controls {
    position: absolute;
    width: 300px;
    height: 50px;
    padding: 8px 16px;
    top: -53px;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
  }
  .music-player .input-group--slider.input-group--prepend-icon .slider {
    margin-left: 16px;
  }
</style>
