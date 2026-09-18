import type { InjectionKey, Ref } from 'vue'

// Theme
export interface Theme {
  name: 'light' | 'dark'
  isDark: boolean
}

type ThemeKey = InjectionKey<Ref<Theme>>
export const THEME = Symbol('THEME') as ThemeKey
