<template>
  <v-app id="app" toolbar footer fixed-footer>
    <v-navigation-drawer
      class="pb-0"
      persistent
      clipped
      enable-resize-watcher
      v-model="drawer"
    >
      <v-list dense>
        <v-list-tile :to="{name: 'home'}" exact>
          <v-list-tile-action>
            <v-icon>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>主页</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="{name: 'favorites'}">
          <v-list-tile-action>
            <v-icon>favorite</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>收藏的歌</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar fixed dark class="main-navbar teal lighten-2">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>Vue Music Box</v-toolbar-title>
      <v-spacer></v-spacer>
      <music-search-box></music-search-box>
      <v-btn :to="{name: 'favorites'}" icon>
        <v-icon>favorite</v-icon>
      </v-btn>
    </v-toolbar>
    <main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </main>
    <v-footer class="grey darken-3" dark fixed>
      <music-player></music-player>
    </v-footer>
  </v-app>
</template>

<script>
import MusicSearchBox from '@/components/MusicSearchBox'
import MusicPlayer from '@/components/MusicPlayer'

export default {
  name: 'App',
  data () {
    return {
      drawer: true
    }
  },

  components: {
    MusicSearchBox,
    MusicPlayer
  }
}
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app .footer {
  height: 72px;
}

#app > main {
  padding-bottom: 72px;
}
</style>
