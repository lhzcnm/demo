import type { R } from '@/types'

export interface XSliderCaptchaProps {
  verify: (params: XCaptchaCheckParams) => R<string>
  refresh: () => R<XCaptcha>
}

export interface XSliderCaptchaEmits {
  (e: 'verified', id: string): void
}

export interface XTrackList {
  type: 'down' | 'move' | 'up'
  x: number
  y: number
  t: number
}
export interface XCaptcha {
  id: string
  captcha: {
    data: null
    type: 'SLIDER'
    backgroundImage: string
    backgroundImageHeight: number
    backgroundImageTag: string
    backgroundImageWidth: number

    templateImage: string
    templateImageHeight: number
    templateImageTag: 'default'
    templateImageWidth: number
  }
}
export interface XCaptchaCheckParams {
  id: string
  data: {
    bgImageWidth: number
    bgImageHeight: number
    templateImageWidth: number
    templateImageHeight: number
    startTime: number
    stopTime: number
    trackList: XTrackList[]
  }
}
