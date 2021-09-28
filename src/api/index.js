import axios from 'axios'
import { eventBus } from '@/utils'
const baseUrl = 'https://api.obfs.dev/api/netease/'
let store = {
  favorites: [],
  playlist: []
}

// 存储状态到客户端本地
const saveLocalData = (data) => {
  try {
    localStorage.setItem('data', JSON.stringify(data))
  } catch (err) {
    // 忽略写入错误
  }
}

// 载入客户端本地状态
const loadLocalData = () => {
  try {
    let data = localStorage.getItem('data')
    if (data === null) {
      return undefined
    }
    return JSON.parse(data)
  } catch (err) {
    return undefined
  }
}

let localData = loadLocalData()
if (localData) {
  store = localData
}

// 请求搜索音乐列表
export async function fetchSearchList (keyword, offset = 0, limit = 20) {
  let response = await axios.get(baseUrl, {
    params: {
      type: 'search',
      search_type: 1,
      s: keyword,
      offset,
      limit
    }
  })

  // 合成收藏状态
  response.data.result.songs = response.data.result.songs.map(item => {
    item.favorited = store.favorites.some(f => f.id === item.id)
    return item
  })

  return response.data
}

// 请求指定ID的歌曲
export async function fetchMusic (id) {
  let response = await axios.get(baseUrl, {
    params: {
      type: 'song',
      id: id,
      br: 128000
    }
  })

  return response.data.data[0]
}

// 获取收藏列表
export function loadFavoritesList (offset = 0, limit = 20) {
  return {
    favorites: store.favorites.slice(offset, limit + offset + 1),
    songCount: store.favorites.length
  }
}

// 切换歌曲收藏状态
export function toggleMusicFavorite (musicItem) {
  let index = store.favorites.findIndex(item => item.id === musicItem.id)
  let favorited = index !== -1
  if (favorited) {
    store.favorites.splice(index, 1)
    musicItem.favorited = false
  } else {
    musicItem.favorited = true
    store.favorites.push(musicItem)
  }

  saveLocalData(store)
  return !favorited
}

// 获取播放列表
export function loadPlaylist () {
  return store.playlist
}

// 添加歌曲到播放列表
export function addMusicToPlaylist (musicItem) {
  if (!store.playlist.some(item => item.id === musicItem.id)) {
    store.playlist.push(musicItem)
    saveLocalData(store)
    eventBus.$emit('playlistChange', store.playlist)
  }
  return store.playlist
}

// 清空播放列表
export function clearPlaylist () {
  store.playlist = []
  eventBus.$emit('playlistChange', store.playlist)
  saveLocalData(store)
}
