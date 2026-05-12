import { FlexWidget, TextWidget } from 'react-native-android-widget'

import { BRAND } from '@/constants/brand'

/**
 * 홈 화면 위젯 — 탭 시 음성 주문 화면이 열리며 즉시 녹음 시작.
 *
 * <ul>
 *   <li>UI 는 RemoteViews 로 컴파일됨 — Tailwind/NativeWind 사용 불가, 인라인 style 만</li>
 *   <li>clickAction: deep link → expo-router 의 voice-order 라우트, autoStart=1 search param</li>
 * </ul>
 */
export function VoiceOrderWidget() {
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: 'cheonilapp://voice-order?autoStart=1' }}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BRAND.primary[500],
        borderRadius: 16,
        padding: 12,
      }}
    >
      <TextWidget
        text="🎤"
        style={{ fontSize: 22, marginRight: 8 }}
      />
      <TextWidget
        text="음성 주문"
        style={{ fontSize: 16, fontWeight: '700', color: '#ffffff' }}
      />
    </FlexWidget>
  )
}
