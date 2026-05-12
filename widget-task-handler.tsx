import type { WidgetTaskHandlerProps } from 'react-native-android-widget'

import { VoiceOrderWidget } from '@/widgets/VoiceOrderWidget'

/**
 * react-native-android-widget 의 진입점.
 *
 * 위젯 lifecycle 이벤트 (추가/갱신/리사이즈/삭제) 시 안드로이드가 이 파일의 핸들러를 호출.
 * 프로젝트 루트에 두면 plugin 이 자동 감지. 다른 경로 사용 시 app.json 의
 * `widgetTaskHandlerPath` 로 명시.
 */
const nameToWidget = {
  VoiceOrder: VoiceOrderWidget,
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo
  const Widget = nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget]
  if (!Widget) return

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      props.renderWidget(<Widget />)
      break
    case 'WIDGET_DELETED':
      // 정리할 리소스 없음
      break
    default:
      break
  }
}
