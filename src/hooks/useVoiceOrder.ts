import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio'
import { useCallback, useRef, useState } from 'react'

import {
  createVoiceOrder,
  VoiceOrderApiError,
  type VoiceOrderCreateRes,
  type VoiceOrderErrorCode,
} from '@/apis/voiceOrderApi'

export type VoiceOrderState = 'idle' | 'recording' | 'sending' | 'success' | 'error'

interface VoiceOrderError {
  message: string
  code?: VoiceOrderErrorCode
  transcribedText?: string | null
}

/**
 * 마이크 녹음 → /api/voice-order/create-order 호출 → 결과/에러 상태 보관.
 *
 * 흐름:
 *  1. `start()` — 마이크 권한 요청 (필요 시) + 녹음 시작 (state: recording)
 *  2. `stopAndSend()` — 녹음 종료 + 서버 업로드 (sending → success/error)
 *  3. `reset()` — 결과/에러 초기화 후 idle
 *
 * PWA 의 useVoiceOrder 와 거의 동일 API. 차이:
 *  - MediaRecorder → expo-audio `useAudioRecorder`
 *  - Blob → file URI ({ uri, name, type } 형식으로 FormData 에 전달)
 */
export function useVoiceOrder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const [state, setState] = useState<VoiceOrderState>('idle')
  const [result, setResult] = useState<VoiceOrderCreateRes | null>(null)
  const [error, setError] = useState<VoiceOrderError | null>(null)

  // recorder 가 비동기로 prepare 되는 동안 stop 호출 막기 위한 가드
  const preparingRef = useRef(false)

  const start = useCallback(async () => {
    if (state === 'recording' || state === 'sending' || preparingRef.current) return
    setError(null)
    setResult(null)

    try {
      // 권한 요청 — denied 시 status.granted false
      const perm = await AudioModule.requestRecordingPermissionsAsync()
      if (!perm.granted) {
        setError({ message: '마이크 권한이 필요합니다. 설정에서 허용해주세요.' })
        setState('error')
        return
      }

      // iOS 가 silent mode 일 때도 녹음/재생 가능하도록
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      })

      preparingRef.current = true
      await recorder.prepareToRecordAsync()
      recorder.record()
      preparingRef.current = false
      setState('recording')
    } catch (e) {
      preparingRef.current = false
      const msg = e instanceof Error ? e.message : '마이크 사용 불가'
      setError({ message: `녹음 시작 실패: ${msg}` })
      setState('error')
    }
  }, [recorder, state])

  const stopAndSend = useCallback(async () => {
    if (state !== 'recording') return

    try {
      await recorder.stop()
    } catch (e) {
      const msg = e instanceof Error ? e.message : '녹음 종료 실패'
      setError({ message: msg })
      setState('error')
      return
    }

    const uri = recorder.uri
    if (!uri) {
      setError({ message: '녹음 파일을 찾을 수 없습니다.' })
      setState('error')
      return
    }

    setState('sending')
    try {
      // m4a (iOS/Android HIGH_QUALITY preset 기본 출력) — IANA 표준 MIME 은 audio/mp4.
      const res = await createVoiceOrder({
        uri,
        name: 'speech.m4a',
        type: 'audio/mp4',
      })
      setResult(res)
      setState('success')
    } catch (e) {
      if (e instanceof VoiceOrderApiError) {
        setError({
          message: e.message,
          code: e.body?.code,
          transcribedText: e.body?.transcribedText,
        })
      } else {
        setError({ message: e instanceof Error ? e.message : '주문 처리 실패' })
      }
      setState('error')
    }
  }, [recorder, state])

  const reset = useCallback(() => {
    if (state === 'recording' || state === 'sending') return
    setState('idle')
    setResult(null)
    setError(null)
  }, [state])

  return { state, result, error, start, stopAndSend, reset }
}
