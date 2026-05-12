import { useLocalSearchParams } from 'expo-router'

import VoiceOrderScreen from '@/components/voice-order/VoiceOrderScreen'

/**
 * 라우트 진입점 — search param `autoStart=1` 이 있으면 즉시 녹음 시작 (홈 화면 위젯 흐름).
 */
export default function VoiceOrderRoute() {
  const { autoStart } = useLocalSearchParams<{ autoStart?: string }>()
  return <VoiceOrderScreen autoStart={autoStart === '1'} />
}
