/**
 * 搜索结果格式化工具
 * 将 QQ 音乐上游返回的复杂数据结构转换为前端友好的格式
 */

// ============ 类型定义 ============

/** 格式化后的歌手信息 */
export interface FormattedSinger {
  id: number;
  mid: string;
  name: string;
}

/** 格式化后的专辑信息 */
export interface FormattedAlbum {
  id: number;
  mid: string;
  name: string;
  cover: string;
}

/** 格式化后的 MV 信息 */
export interface FormattedMv {
  id: number;
  vid: string;
}

/** 格式化后的付费信息 */
export interface FormattedPay {
  payPlay: boolean;
  payDownload: boolean;
}

/** 格式化后的文件信息 */
export interface FormattedFile {
  mediaMid: string;
  size128mp3: number;
  size320mp3: number;
  sizeFlac: number;
}

/** 格式化后的歌曲项 */
export interface FormattedSongItem {
  id: number;
  mid: string;
  name: string;
  title: string;
  duration: number;
  publishTime: string;
  album: FormattedAlbum;
  singers: FormattedSinger[];
  mv: FormattedMv | null;
  pay: FormattedPay;
  file: FormattedFile;
}

/** 格式化后的专辑项 */
export interface FormattedAlbumItem {
  id: number;
  mid: string;
  name: string;
  cover: string;
  publishTime: string;
  songCount: number;
  singer: FormattedSinger;
}

/** 格式化后的歌单项 */
export interface FormattedPlaylistItem {
  id: number;
  name: string;
  cover: string;
  playCount: number;
  creator: {
    name: string;
  };
}

/** 格式化后的歌手项 */
export interface FormattedSingerItem {
  id: number;
  mid: string;
  name: string;
  avatar: string;
  songCount: number;
  albumCount: number;
}

/** 格式化后的 MV 项 */
export interface FormattedMvItem {
  id: number;
  vid: string;
  name: string;
  cover: string;
  duration: number;
  publishTime: string;
  playCount: number;
  singers: FormattedSinger[];
}

/** 分页信息 */
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** 格式化后的搜索结果 */
export interface FormattedSearchResult<T> {
  code: number;
  data: {
    list: T[];
  } & PaginationMeta;
}

// ============ 格式化函数 ============

/**
 * 生成专辑封面 URL
 */
function getAlbumCover(albumMid: string, size = 300): string {
  if (!albumMid) return '';
  return `https://y.gtimg.cn/music/photo_new/T002R${size}x${size}M000${albumMid}.jpg`;
}

/**
 * 生成歌手头像 URL
 */
function getSingerAvatar(singerMid: string, size = 300): string {
  if (!singerMid) return '';
  return `https://y.gtimg.cn/music/photo_new/T001R${size}x${size}M000${singerMid}.jpg`;
}

/**
 * 格式化歌曲列表
 */
export function formatSongList(rawList: any[]): FormattedSongItem[] {
  if (!Array.isArray(rawList)) return [];

  return rawList.map((song) => ({
    id: song.id || 0,
    mid: song.mid || '',
    name: song.name || '',
    title: song.title || song.name || '',
    duration: song.interval || 0,
    publishTime: song.time_public || '',
    album: {
      id: song.album?.id || 0,
      mid: song.album?.mid || '',
      name: song.album?.name || '',
      cover: getAlbumCover(song.album?.mid),
    },
    singers: (song.singer || []).map((s: any) => ({
      id: s.id || 0,
      mid: s.mid || '',
      name: s.name || '',
    })),
    mv: song.mv?.vid
      ? {
          id: song.mv.id || 0,
          vid: song.mv.vid,
        }
      : null,
    pay: {
      payPlay: Boolean(song.pay?.pay_play),
      payDownload: Boolean(song.pay?.pay_down),
    },
    file: {
      mediaMid: song.file?.media_mid || '',
      size128mp3: song.file?.size_128mp3 || 0,
      size320mp3: song.file?.size_320mp3 || 0,
      sizeFlac: song.file?.size_flac || 0,
    },
  }));
}

/**
 * 格式化专辑列表
 */
export function formatAlbumList(rawList: any[]): FormattedAlbumItem[] {
  if (!Array.isArray(rawList)) return [];

  return rawList.map((album) => ({
    id: album.albumID || 0,
    mid: album.albumMID || '',
    name: album.albumName || '',
    cover: album.albumPic || getAlbumCover(album.albumMID),
    publishTime: album.publicTime || '',
    songCount: album.song_count || 0,
    singer: {
      id: album.singerID || album.singer_list?.[0]?.id || 0,
      mid: album.singerMID || album.singer_list?.[0]?.mid || '',
      name: album.singerName || album.singer_list?.[0]?.name || '',
    },
  }));
}

/**
 * 格式化歌单列表
 */
export function formatPlaylistList(rawList: any[]): FormattedPlaylistItem[] {
  if (!Array.isArray(rawList)) return [];

  return rawList.map((playlist) => ({
    id: playlist.dissid || playlist.tid || 0,
    name: playlist.dissname || playlist.title || '',
    cover: playlist.imgurl || playlist.cover || '',
    playCount: playlist.listennum || playlist.play_count || 0,
    creator: {
      name: playlist.creator?.name || playlist.nickname || '',
    },
  }));
}

/**
 * 格式化歌手列表
 */
export function formatSingerList(rawList: any[]): FormattedSingerItem[] {
  if (!Array.isArray(rawList)) return [];

  return rawList.map((singer) => ({
    id: singer.singerID || singer.id || 0,
    mid: singer.singerMID || singer.mid || '',
    name: singer.singerName || singer.name || '',
    avatar: singer.singerPic || getSingerAvatar(singer.singerMID || singer.mid),
    songCount: singer.songNum || singer.song_count || 0,
    albumCount: singer.albumNum || singer.album_count || 0,
  }));
}

/**
 * 格式化 MV 列表
 */
export function formatMvList(rawList: any[]): FormattedMvItem[] {
  if (!Array.isArray(rawList)) return [];

  return rawList.map((mv) => ({
    id: mv.id || mv.mv_id || 0,
    vid: mv.vid || mv.v_id || '',
    name: mv.mv_name || mv.title || mv.name || '',
    cover: mv.mv_pic_url || mv.pic || '',
    duration: mv.duration || 0,
    publishTime: mv.publish_date || '',
    playCount: mv.play_count || mv.playcnt || 0,
    singers: (mv.singer_list || mv.singers || []).map((s: any) => ({
      id: s.id || 0,
      mid: s.mid || '',
      name: s.name || '',
    })),
  }));
}

/**
 * 提取分页元信息
 */
export function extractPaginationMeta(meta: any, listLength: number): PaginationMeta {
  const total = meta?.sum || meta?.estimate_sum || 0;
  const page = meta?.curpage || 1;
  const pageSize = meta?.perpage || listLength || 10;
  const hasMore = page * pageSize < total;

  return { total, page, pageSize, hasMore };
}

/**
 * 搜索类型枚举
 */
export enum SearchType {
  SONG = 0,
  ALBUM = 2,
  PLAYLIST = 3,
  LYRIC = 7,
  ALBUM_V2 = 8,
  SINGER = 9,
  MV = 12,
}

/**
 * 根据搜索类型格式化搜索结果
 */
export function formatSearchResult(
  rawResponse: any,
  searchType: number,
): FormattedSearchResult<any> {
  const serviceData = rawResponse?.['music.search.SearchCgiService'];
  if (!serviceData || serviceData.code !== 0) {
    return {
      code: serviceData?.code ?? -1,
      data: {
        list: [],
        total: 0,
        page: 1,
        pageSize: 10,
        hasMore: false,
      },
    };
  }

  const body = serviceData.data?.body || {};
  const meta = serviceData.data?.meta || {};

  let list: any[] = [];

  switch (searchType) {
    case SearchType.SONG:
    case SearchType.LYRIC:
      list = formatSongList(body.song?.list || []);
      break;
    case SearchType.ALBUM:
    case SearchType.ALBUM_V2:
      list = formatAlbumList(body.album?.list || []);
      break;
    case SearchType.PLAYLIST:
      list = formatPlaylistList(body.songlist?.list || []);
      break;
    case SearchType.SINGER:
      list = formatSingerList(body.singer?.list || []);
      break;
    case SearchType.MV:
      list = formatMvList(body.mv?.list || []);
      break;
    default:
      list = formatSongList(body.song?.list || []);
  }

  const pagination = extractPaginationMeta(meta, list.length);

  return {
    code: 0,
    data: {
      list,
      ...pagination,
    },
  };
}
