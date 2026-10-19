import { useSyncExternalStore } from 'react'

type Toast = { id: number; text: string; action?: { label: string; run: () => void } }
let items: Toast[] = []
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function toast(text: string, action?: Toast['action'], ms = action ? 0 : 3500) {
  const t = { id: Date.now() + Math.random(), text, action }
  items = [...items, t]
  emit()
  if (ms) setTimeout(() => dismiss(t.id), ms)
}
export function dismiss(id: number) {
  items = items.filter((t) => t.id !== id)
  emit()
}
export const useToasts = () =>
  useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => items)
