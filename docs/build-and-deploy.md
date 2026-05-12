# 빌드 + 배포 가이드 (dev / production / 홈 위젯)

> Expo Go 로는 못 도는 네이티브 모듈 (`react-native-android-widget`, `expo-audio` 등) 을 쓰므로 **dev build / production build** 별도 관리. 이 문서는 두 흐름 + Play Store 내부 테스트 + 위젯 테스트까지 한 번에 정리.

---

## 0. 빌드 프로필 개요

`eas.json` 의 3가지 프로필:

| 프로필 | 출력 | dev-client | Metro 연결 | 사이닝 | 용도 |
|--------|------|------------|-----------|--------|------|
| **development** | `.apk` | ✅ | ✅ | EAS | 코드 작성 중 즉시 반영 |
| **preview** | `.apk` | ❌ | ❌ | EAS | 진짜 동작 내부 공유 |
| **production** | **`.aab`** | ❌ | ❌ | EAS (release keystore) | **Play Store 업로드 / 일반 배포** |

같은 `applicationId` 라 한 디바이스에 dev + production 동시 설치 불가 — 한쪽 지우고 다른 쪽 설치.

---

## 1. 사전 준비

### expo-dev-client 설치 (dev build 시 필수)

dev build APK 가 Metro 와 통신하려면 런타임 라이브러리가 필요. 없으면 Fast Refresh 미지원 + 매 변경마다 재빌드.

```bash
cd /Users/banhyungil/workspace/projects/cheonil-app
npx expo install expo-dev-client
```

### 위젯 의존성

```bash
npx expo install react-native-android-widget
```

### EAS 로그인 (한 번만)

```bash
npx eas-cli login
```
Expo 계정 credential 입력.

---

## 2. Dev Build — 개발용

EAS 클라우드에서 ~10~15분 후 APK.

```bash
npx eas-cli build --profile development --platform android
```

진행 중:
- "Generate keystore?" → **Yes** (첫 빌드)
- 그 외 default

빌드 끝나면 터미널의 빌드 페이지 URL → 브라우저 / 디바이스에서 APK 다운로드 → 설치 (알 수 없는 소스 허용).

### 로컬 빌드 대안 (Android Studio + SDK 있을 때)

```bash
npx expo prebuild --clean
npx expo run:android
```

USB 디버깅 디바이스 또는 에뮬레이터 필요. 첫 빌드 5~10분.

⚠️ `prebuild --clean` 은 `android/` `ios/` 재생성 — 커스텀 네이티브 수정 있으면 백업.

### Metro 연결 — JS 코드 변경 즉시 반영

dev build 설치 후:
```bash
npx expo start --dev-client
```

PC 에서 Metro 띄우고 → 디바이스에서 앱 열면 자동 연결. 저장 시 Fast Refresh.

- 강제 reload: 터미널에서 `r` 또는 디바이스 흔들기 → "Reload"
- 캐시 꼬임: `npx expo start --dev-client --clear`

---

## 3. Production Build — Play Store 배포용

```bash
# 의미 있는 릴리스면 app.json 의 "version" 먼저 올림 (예: 1.0.0 → 1.1.0)
npx eas-cli build --profile production --platform android
```

15~20분. AAB (App Bundle) 가 출력 — Play Store 가 요구하는 포맷.

### versionCode 자동 증가

`eas.json` 의 production:
```json
"production": {
  "channel": "production",
  "autoIncrement": true
}
```

매 빌드마다 versionCode +1 → Play Console 의 중복 거부 방지. `version` (사용자 노출 문자열) 은 수동.

### AAB 다운로드

빌드 완료 시 터미널 출력 또는:
```bash
npx eas-cli build:download --platform android
```

`.aab` 가 로컬에 떨어짐.

---

## 4. Play Console — 내부 테스트 트랙 업로드

가족 매장 / 최대 100명 테스터 시나리오. 검토 빠름 (수 시간~1일).

### 첫 등록 (1회)
1. Play Console → **앱 만들기**
2. 앱 이름, 기본 언어 (한국어), 무료/유료
3. 패키지명 — `app.json` 의 `"package": "com.cheonil.app"` 과 정확히 일치

### 새 버전 만들기
1. 좌측 메뉴 → **테스트 → 내부 테스트**
2. **새 버전 만들기**
3. App Bundle 영역에 **`.aab` 드래그** → 자동 업로드
4. 변경사항 메모 (예: "초기 출시")
5. **저장 → 검토 → 출시**

### 테스터 추가
1. **테스터 탭** → 이메일 주소 추가 (G메일)
2. **Opt-in URL** 발급 → 디바이스에서 열어 "테스터로 참여" → Play Store 의 설치 링크

### 필수 등록 항목

내부 테스트도 일부 필수. 메인 메뉴에서 누락 항목 표시됨.

| 항목 | 위치 | 비고 |
|------|------|------|
| 앱 정보 / 카테고리 | 메인 스토어 등록정보 | 음식·음료 |
| 짧은 설명 / 자세한 설명 | 메인 스토어 등록정보 | 한국어 |
| 그래픽 자료 | 메인 스토어 등록정보 | 아이콘, 피처 그래픽, 스크린샷 |
| **개인정보 처리방침 URL** | 앱 콘텐츠 | **필수** — 음성 데이터 수집하므로 |
| **데이터 안전성** 양식 | 앱 콘텐츠 | 음성 녹음, 텍스트, 주문 정보 명시 |
| 권한 사용 사유 | 앱 콘텐츠 | 마이크 = "음성 주문 입력" |
| 대상 연령 | 앱 콘텐츠 | 만 13세 이상 |

**개인정보 처리방침** 은 가장 발 묶이는 항목. GitHub Pages / Notion 공개 페이지 등으로 간단히 작성:
- 수집 항목: 음성 녹음, 변환 텍스트, 주문 시간/메뉴
- 보유 기간: 365일 (백엔드 retention 기준)
- 제3자 제공: Google Cloud STT (fallback 시)
- 삭제 절차

---

## 5. 홈 위젯 테스트

빌드 종류 무관 (dev / production 둘 다 같은 코드).

1. 디바이스 홈 화면 빈 곳 **길게 터치**
2. "위젯" 선택
3. **cheonil-app** 찾기
4. "음성 주문" 위젯을 홈 화면으로 끌어다 놓기
5. 위젯 탭 → 앱 자동 열림 + 즉시 녹음 시작

흐름:
```
[홈 위젯 탭]
    ↓ deep link: cheonilapp://voice-order?autoStart=1
[expo-router → /voice-order]
    ↓ useLocalSearchParams 로 autoStart=1 인식
[VoiceOrderScreen autoStart prop=true]
    ↓ useEffect 첫 마운트
[useVoiceOrder.start() 자동 호출]
    ↓
[녹음 시작 → 사용자 탭 1번으로 정지+전송]
```

---

## 6. 변경 영향 매트릭스

| 변경 | 필요 작업 |
|------|----------|
| JS/TS 코드 (컴포넌트, 훅, api 등) | Metro 가 자동 반영 (또는 `r` reload) |
| `tailwind.config.js` 색상 변경 | Metro reload (`r`) |
| `app.json` plugins/permissions | **재빌드 필요** (`eas-cli build`) |
| 위젯 컴포넌트 코드 | **재빌드 필요** — 위젯은 RemoteViews 로 컴파일되어 APK/AAB 안 |
| `widget-task-handler.tsx` 등록 | **재빌드 필요** |
| native 모듈 신규 설치 | **재빌드 필요** |
| 의미 있는 릴리스 (Play Store) | `app.json` 의 `version` 올림 + production 재빌드 |

룰: **package.json / app.json 건드렸으면 재빌드**, JS 만 바꿨으면 Metro reload.

---

## 7. 후속 업데이트 cycle

### 개발 중
```bash
# Metro 만 띄우기 (dev build 가 폰에 깔린 상태)
npx expo start --dev-client
```
코드 수정 → 자동 반영. 가끔 캐시 꼬이면 `r` reload. native 변경 시에만 dev build 재빌드.

### Play Store 업데이트
```
1. 코드 수정 (JS / 위젯 / native config)
2. dev build 로 로컬 검증
3. app.json 의 "version" 의미 있게 올림 (필요 시)
4. npx eas-cli build --profile production --platform android
5. AAB 다운로드 → Play Console 내부 테스트 → 새 버전 → 업로드 → 출시
6. 디바이스에서 Play Store 가 자동 업데이트 알림
```

---

## 8. 트러블슈팅

### "expo-dev-client not installed" 에러
```bash
npx expo install expo-dev-client
```

### EAS 로그인 안 됨
```bash
npx eas-cli logout
npx eas-cli login
```
또는 expo.dev 에서 access token 만들어 `EXPO_TOKEN` env var 로.

### "Plugin not found: react-native-android-widget" 경고
설치 안 됐거나 node_modules 에 없음. `npx expo install react-native-android-widget` 다시.

### APK 설치 시 "앱이 설치되지 않음"
- 알 수 없는 소스 허용 필요 — 브라우저별로 "이 앱 설치 허용"
- 이전 버전 충돌이면 기존 cheonil-app 삭제 후 재설치

### 위젯이 위젯 목록에 안 나타남
- `app.json` 의 `widgets` 배열 `name` 이 task handler 의 `nameToWidget` 키와 일치해야 함
- 재빌드 안 됐을 가능성 — APK/AAB 다시 설치

### 위젯 탭해도 앱 안 열림
- `app.json` 의 `scheme` 가 deep link URI 와 일치 (`cheonilapp://...`)
- 위젯 코드의 `clickActionData.uri` 확인

### Metro 가 디바이스 못 찾음
- 같은 WiFi 네트워크
- 방화벽 8081 포트 허용
- USB 연결이면 `adb reverse tcp:8081 tcp:8081`

### Play Console "이미 사용된 versionCode" 거부
`autoIncrement` 가 있어도 빌드 취소/실패 등으로 카운터 꼬일 수 있음. `app.json` 의 `versionCode` 직접 명시해서 우회.

### 위젯이 production 에선 동작 X (dev 에선 됐는데)
proguard / R8 minification 영향 가능성. `eas.json` 의 production 에서 minification 옵션 검토.

---

## 9. 주의사항

### 키스토어 분실 절대 금지
EAS 가 관리하지만 본인 Expo 계정에 묶임. 계정 잃으면 같은 앱으로 업데이트 불가. **2FA + 백업 코드 보관**.

```bash
npx eas-cli credentials
```

### applicationId 변경 금지
Play Store 등록 후 `app.json` 의 `package` 바꾸면 **별개 앱**. 기존 앱 업데이트 못 함. 처음에 신중히.

### dev build / production build 동시 설치 불가
같은 `applicationId` 라 충돌. 한쪽 지우고 다른 쪽 설치.

---

## 참고

- [Expo Dev Client](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build](https://docs.expo.dev/build/setup/)
- [EAS Build profiles](https://docs.expo.dev/eas/json/)
- [react-native-android-widget](https://github.com/sAleksovski/react-native-android-widget)
- [Google Play 데이터 안전성](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Play Console 내부 테스트](https://support.google.com/googleplay/android-developer/answer/9845334)
