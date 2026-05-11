import { fetch } from 'expo/fetch'
import { File } from 'expo-file-system'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.cheonil.org'

/** 백엔드 OrderMenuExtRes 와 동일. 표시용. */
export interface VoiceOrderMenu {
  menuSeq: number
  orderSeq: number
  price: number
  cnt: number
  menuNm: string
  menuNmS: string | null
}

/** 백엔드 OrderExtRes — 필요한 필드만. */
export interface VoiceOrderResult {
  seq: number
  storeSeq: number
  amount: number
  status: string
  orderAt: string
  storeNm: string | null
  cmt: string | null
  menus: VoiceOrderMenu[]
}

export interface VoiceOrderCreateRes {
  order: VoiceOrderResult
  transcribedText: string
  confirmation: string
}

export type VoiceOrderErrorCode =
  | 'STORE_NOT_MATCHED'
  | 'NO_ITEMS'
  | 'UNMATCHED_FRAGMENTS'
  | 'INVALID_MENU'
  | 'INVALID_QUANTITY'

export interface VoiceOrderErrorBody {
  status: number
  code: VoiceOrderErrorCode
  message: string
  transcribedText: string | null
  parsed: unknown
  timestamp: string
}

export class VoiceOrderApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: VoiceOrderErrorBody | null,
  ) {
    super(message)
    this.name = 'VoiceOrderApiError'
  }
}

/**
 * 녹음된 오디오 파일 (URI) → 주문 생성.
 *
 * 모던 패턴 — `expo/fetch` (streaming 지원, Hermes 친화) + `expo-file-system`의 `File` (Blob 인터페이스
 * 구현). RN 의 axios + 비표준 FormData 조합보다 안정적이고 표준 Web API 와 동일한 호출 방식.
 *
 * 4xx 응답은 {@link VoiceOrderApiError} 로 throw — body.code 로 사용자 멘트 분기 가능.
 */
export async function createVoiceOrder(audio: {
  uri: string
  name: string
  type: string
}): Promise<VoiceOrderCreateRes> {
  const file = new File(audio.uri)
  // File 이 Blob 인터페이스를 구현 → FormData 에 표준 방식으로 첨부
  const formData = new FormData()
  formData.append('audio', file as unknown as Blob, audio.name)

  const res = await fetch(`${API_BASE_URL}/api/voice-order/create-order`, {
    method: 'POST',
    body: formData,
  })

  if (res.ok) {
    return (await res.json()) as VoiceOrderCreateRes
  }

  // 에러 응답 — JSON 본문 시도
  let body: VoiceOrderErrorBody | null = null
  let raw = ''
  try {
    raw = await res.text()
    body = JSON.parse(raw) as VoiceOrderErrorBody
  } catch {
    // JSON 아닌 응답
  }
  throw new VoiceOrderApiError(body?.message ?? `HTTP ${res.status}: ${raw}`, res.status, body)
}
