import { Layout } from '../types'

const LAYOUT_CYCLE: Layout[] = [
  'text-only',
  'image-right',
  'image-left',
  'image-fullscreen',
]

export function assignLayout(index: number): Layout {
  return LAYOUT_CYCLE[index % 4]
}

export interface FontState {
  /** Content (3rd level) font size in px. Min: MIN_FONT_SIZE */
  fontSize: number
  /** Subtitle (2nd level) font size in px. Min: MIN_SUBTITLE_SIZE */
  subtitleSize: number
  /** Column count: 1 or 2 */
  columns: number
}

export const DEFAULT_FONT_STATE: FontState = {
  fontSize: 16,
  subtitleSize: 22,
  columns: 1,
}

export const MIN_FONT_SIZE = 9
export const MIN_SUBTITLE_SIZE = 12
export const MAX_COLUMNS = 2

/** Threshold: only reduce fonts when total 3rd-level items exceed this. */
export const OVERFLOW_ITEM_THRESHOLD = 8

/**
 * Returns the next adjusted FontState to reduce overflow, stepping by 2px.
 * Returns null when already at minimum — no further reduction possible.
 */
export function adjustFontState(current: FontState): FontState | null {
  // Step 1: try two columns first
  if (current.columns < MAX_COLUMNS) {
    return { ...current, columns: MAX_COLUMNS }
  }

  // Step 2: reduce font sizes by 2px per step
  const canReduceFont = current.fontSize > MIN_FONT_SIZE
  const canReduceSubtitle = current.subtitleSize > MIN_SUBTITLE_SIZE

  if (canReduceFont || canReduceSubtitle) {
    return {
      ...current,
      fontSize: Math.max(MIN_FONT_SIZE, current.fontSize - 2),
      subtitleSize: Math.max(MIN_SUBTITLE_SIZE, current.subtitleSize - 2),
    }
  }

  return null // Already at minimum
}
