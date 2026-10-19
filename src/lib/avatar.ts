import { useEffect, useState } from 'react'
import type { Style } from '@dicebear/core'

// Cada estilo es un chunk aparte (algunos pesan >250 KB): solo se baja el que se usa.
const LOADERS = {
  adventurer: () => import('@dicebear/adventurer'),
  bigSmile: () => import('@dicebear/big-smile'),
  funEmoji: () => import('@dicebear/fun-emoji'),
  lorelei: () => import('@dicebear/lorelei'),
  notionists: () => import('@dicebear/notionists'),
  thumbs: () => import('@dicebear/thumbs'),
}
export type AvatarStyle = keyof typeof LOADERS
export const AVATAR_STYLE_IDS = Object.keys(LOADERS) as AvatarStyle[]
export const AVATAR_LABELS: Record<AvatarStyle, string> = {
  adventurer: 'Aventura', bigSmile: 'Sonrisa', funEmoji: 'Emoji', lorelei: 'Lorelei', notionists: 'Trazo', thumbs: 'Pulgar',
}

const cache = new Map<string, string>()
async function render(style: AvatarStyle, seed: string, bg: string) {
  const key = `${style}|${seed}|${bg}`
  const hit = cache.get(key)
  if (hit) return hit
  const [{ createAvatar }, mod] = await Promise.all([import('@dicebear/core'), LOADERS[style]()])
  const uri = createAvatar(mod as unknown as Style<object>, { seed, backgroundColor: [bg.replace('#', '')], radius: 50 }).toDataUri()
  cache.set(key, uri)
  return uri
}

/** data URI del avatar, o null mientras carga (o si no hay estilo). */
export function useAvatarUri(style: AvatarStyle | null | undefined, seed: string, bg: string) {
  const key = style ? `${style}|${seed}|${bg}` : ''
  const [uri, setUri] = useState<string | null>(() => cache.get(key) ?? null)
  useEffect(() => {
    if (!style) { setUri(null); return }
    let alive = true
    render(style, seed, bg).then((u) => { if (alive) setUri(u) }).catch(() => {})
    return () => { alive = false }
  }, [style, seed, bg, key])
  return uri
}

export const randomSeed = () => Math.random().toString(36).slice(2, 10)
