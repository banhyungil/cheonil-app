import { FontAwesome } from '@expo/vector-icons'
import { useEffect, useMemo, useRef } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useVoiceOrder } from '@/hooks/useVoiceOrder'

interface VoiceOrderScreenProps {
  /** true 면 화면 진입과 동시에 자동 녹음 시작 (위젯 탭 → autoStart=1 deep link 경로). */
  autoStart?: boolean
}

export default function VoiceOrderScreen({ autoStart = false }: VoiceOrderScreenProps) {
  const { state, result, error, start, stopAndSend, reset } = useVoiceOrder()

  // 위젯에서 들어왔을 때 (autoStart=true) 첫 마운트 시 1회만 녹음 시작.
  // state 가 idle 이 아니면 (이미 다른 흐름 진행 중) 건너뛰기.
  const autoStartedRef = useRef(false)
  useEffect(() => {
    if (!autoStart || autoStartedRef.current) return
    if (state !== 'idle') return
    autoStartedRef.current = true
    void start()
  }, [autoStart, state, start])

  const buttonLabel = useMemo(() => {
    switch (state) {
      case 'idle':
        return '눌러서 녹음'
      case 'recording':
        return '멈추고 전송'
      case 'sending':
        return '처리 중…'
      case 'success':
        return '다시 녹음'
      case 'error':
      default:
        return '다시 시도'
    }
  }, [state])

  function onTap() {
    if (state === 'idle' || state === 'success' || state === 'error') {
      if (state !== 'idle') reset()
      void start()
    } else if (state === 'recording') {
      void stopAndSend()
    }
  }

  // 마이크 버튼 상태별 배경색 — primary (천일 그린) 가 기본 브랜드, 녹음 중 red, 에러 amber, 전송 중 slate
  const micBg =
    state === 'recording'
      ? 'bg-red-500'
      : state === 'sending'
        ? 'bg-slate-500'
        : state === 'error'
          ? 'bg-amber-500'
          : 'bg-primary-500'

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top']}>
      <View className="flex-1 items-center justify-between px-5 pb-15 pt-3">
        {/* 헤더 */}
        <View className="items-center">
          <Text className="text-2xl font-bold text-slate-900 dark:text-slate-50">천일식당</Text>
          <Text className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            매장명 + 메뉴 + 수량을 또박또박 발음해주세요
          </Text>
        </View>

        {/* 상태 카드 */}
        <ScrollView
          className="w-full"
          contentContainerClassName="flex-grow items-center justify-center py-4"
          showsVerticalScrollIndicator={false}
        >
          {state === 'success' && result ? (
            <View className="w-full max-w-md gap-2 rounded-2xl border-l-4 border-primary-500 bg-white px-5 py-4 dark:bg-slate-800">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                주문 완료
              </Text>
              <Text className="text-base italic leading-relaxed text-slate-600 dark:text-slate-300">
                &quot;{result.transcribedText}&quot;
              </Text>
              <Text className="text-base leading-relaxed text-slate-900 dark:text-slate-50">
                {result.confirmation}
              </Text>
            </View>
          ) : state === 'error' && error ? (
            <View className="w-full max-w-md gap-2 rounded-2xl border-l-4 border-red-500 bg-white px-5 py-4 dark:bg-slate-800">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                실패
              </Text>
              <Text className="text-base leading-relaxed text-slate-900 dark:text-slate-50">
                {error.message}
              </Text>
              {error.transcribedText && (
                <Text className="text-base italic leading-relaxed text-slate-600 dark:text-slate-300">
                  들은 발화: &quot;{error.transcribedText}&quot;
                </Text>
              )}
            </View>
          ) : state === 'recording' ? (
            <View className="w-full max-w-md flex-row items-center gap-3 rounded-2xl bg-white px-5 py-4 dark:bg-slate-800">
              <View className="h-3.5 w-3.5 rounded-full bg-red-500" />
              <Text className="font-semibold text-red-500">녹음 중</Text>
            </View>
          ) : state === 'sending' ? (
            <View className="w-full max-w-md flex-row items-center gap-3 rounded-2xl bg-white px-5 py-4 dark:bg-slate-800">
              <ActivityIndicator color="#64748b" />
              <Text className="text-base text-slate-700 dark:text-slate-200">전송 중…</Text>
            </View>
          ) : (
            <Text className="text-center text-sm text-slate-400 dark:text-slate-500">
              아래 버튼을 누르면 녹음이 시작됩니다
            </Text>
          )}
        </ScrollView>

        {/* 마이크 버튼 + 라벨 */}
        <View className="items-center">
          <Pressable
            disabled={state === 'sending'}
            onPress={onTap}
            className={`h-40 w-40 items-center justify-center rounded-full ${micBg} active:opacity-80`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            {state === 'sending' ? (
              <ActivityIndicator color="white" size="large" />
            ) : (
              <FontAwesome name="microphone" size={64} color="white" />
            )}
          </Pressable>
          <Text className="mt-4 text-base font-semibold text-slate-600 dark:text-slate-300">
            {buttonLabel}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}
