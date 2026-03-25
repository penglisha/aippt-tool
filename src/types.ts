export interface Section {
  subtitle: string
  content: string[]
}

export type Layout = 'text-only' | 'image-left' | 'image-right' | 'image-fullscreen'

export interface Slide {
  title: string
  sections: Section[]
  layout: Layout
  imageUrl?: string
}
