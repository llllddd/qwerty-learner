import { SoundIcon } from './SoundIcon'
import usePronunciationSound from '@/hooks/usePronunciation'
import type { Word } from '@/typings'
import { Howler } from 'howler'
import { useCallback, useEffect, useImperativeHandle } from 'react'
import React from 'react'

// 导入 Howler 以控制上下文

export const WordPronunciationIcon = React.forwardRef<
  WordPronunciationIconRef,
  { word: Word; lang: string; className?: string; iconClassName?: string }
>(({ word, lang, className, iconClassName }, ref) => {
  const getPlayWord = useCallback(() => {
    if (lang === 'hapin') {
      if (/[\u0400-\u04FF]/.test(word.notation || '')) {
        return word.notation || ''
      } else {
        return word.trans[2]
      }
    }

    // 针对挪威语处理：服务器文件名通常将空格转为下划线
    if (lang === 'no') {
      return word.audio_name || ''
      //return word.name.trim().replace(/\s+/g, '_')
    }

    return word.audio_name || word.name
  }, [word, lang])

  const { play, stop, isPlaying } = usePronunciationSound(getPlayWord())

  const playSound = useCallback(() => {
    // 1. 尝试恢复音频上下文（解决“没有交互不能播放”的问题）
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      Howler.ctx.resume().then(() => {
        stop()
        play()
      })
    } else {
      stop()
      play()
    }
  }, [play, stop])

  // 2. 当单词改变时，立即停止并清理旧音频
  useEffect(() => {
    return () => {
      stop()
    }
  }, [word, stop])

  useImperativeHandle(
    ref,
    () => ({
      play: playSound,
    }),
    [playSound],
  )

  return (
    <SoundIcon
      animated={isPlaying}
      onClick={(e) => {
        e.stopPropagation() // 防止冒泡
        playSound()
      }}
      className={`cursor-pointer text-gray-600 ${className}`}
      iconClassName={iconClassName}
    />
  )
})

WordPronunciationIcon.displayName = 'WordPronunciationIcon'

export type WordPronunciationIconRef = {
  play: () => void
}
