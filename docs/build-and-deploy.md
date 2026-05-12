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

## 9. 첫 출시 시 자주 막히는 검증 항목

Play Console 의 AAB 업로드는 단순 파일 검증 + 정책 검증 두 단계. 자주 걸리는 케이스.

### 9-1. 패키지 이름 mismatch

```
APK 또는 Android App Bundle의 패키지 이름에는 com.ban.cheonil이(가) 있어야 합니다.
```

**원인**: `app.json` 의 `android.package` 가 Play Console 에 등록한 앱의 패키지명과 다름.

**해결**:
1. `app.json` 의 `android.package` 를 Play Console 등록값으로 일치시킴 (iOS bundleIdentifier 도 같이 맞추는 게 깔끔)
2. **재빌드** — 패키지명은 native 코드에 박혀서 JS 변경만으론 안 됨
3. 새 AAB 재업로드

⚠️ 패키지명 변경 = EAS 에선 새 앱으로 인식 → 새 키스토어 발급 prompt 뜸. **아직 Play Store 출시 전이면 Y 로 새 키 발급 OK**.

### 9-2. 개인정보처리방침 URL 누락

```
APK 또는 Android App Bundle에 개인정보처리방침이 필요한 권한을 사용합니다 (android.permission.RECORD_AUDIO).
```

**원인**: 마이크 (RECORD_AUDIO) 권한 쓰면 Play 정책상 개인정보처리방침 URL 필수.

**해결**:
1. PRIVACY.md 같은 정책 페이지 작성 (수집 항목 / 목적 / 보유기간 / 제3자 제공 / 연락처)
2. 공개 URL 발급 (GitHub repo 의 blob URL / Notion 공개 페이지 / Gist 등 — public 접근 가능해야 Google 봇이 읽음)
3. Play Console → **앱 콘텐츠 → 개인정보처리방침** 에 URL 입력

⚠️ private GitHub repo 는 Google 봇 접근 불가 → public 으로 전환하거나 Notion/Gist 사용.

### 9-3. 데이터 안전성 양식

Play Console 의 "데이터 안전성" 섹션도 필수. 어떤 데이터를 수집/공유/암호화하는지 신고:
- 음성 녹음 (수집, 처리)
- 변환 텍스트 (수집, 처리)
- 주문 메타데이터 (수집, 처리)
- 제3자 공유: Google Cloud STT (fallback 시)

---

## 10. 키스토어 lock-in lifecycle

키스토어가 언제 "고정" 되는지 정확히 알면 초반 시행착오에 마음 편함.

| 단계 | 키 lock? | 메모 |
|------|---------|------|
| AAB 업로드 시도 → 검증 실패 (패키지명, 정책 등) | ❌ 아직 | Play DB 에 아무것도 등록 안 됨, 다른 키로 재시도 자유 |
| AAB 업로드 성공 → 출시 드래프트 | ❌ 아직 | 출시 안 했으니 변경 자유 |
| **출시 (Rollout)** → 테스터/사용자에게 배포 | ✅ **여기서 lock** | 이후 같은 키로만 업데이트 가능 |
| 출시 후 키 변경 필요 시 | upload key reset 요청 | Play Console → 앱 무결성 → 1~2일 검토 |

**결론**: **출시 (Rollout) 전까진 자유롭게 새 키 발급/재빌드 가능**. 검증 실패는 lock 트리거가 아님.

### 키 종류 두 가지

| 키 | 누가 관리 | 변경 가능? |
|----|---------|----------|
| **Upload key** | 개발자 (EAS) — AAB 사이닝용 | 가능 (지원 요청, 1~2일) |
| **App signing key** | Google (Play App Signing) — 사용자에게 배포되는 APK 사이닝 | 사실상 고정 |

Play App Signing 가 기본 (2021년 이후 신규 앱) → 개발자는 upload key 만 신경. Google 이 app signing key 보유.

### 키스토어 백업

EAS 가 관리하지만 Expo 계정 잃으면 끝. **2FA + 백업 코드 보관**.

확인/다운로드:
```bash
npx eas-cli credentials
```

---

## 11. 패키지 이름 (applicationId) 운영 룰

### 처음 정할 때 신중

`app.json` 의 `android.package`:
- Play Store 출시 후 변경 불가 (변경하면 별개 앱으로 인식, 기존 앱 업데이트 못 함)
- iOS `bundleIdentifier` 도 같은 값으로 맞추는 게 관례
- 일반적 형식: `com.{org}.{app}` — 예: `com.ban.cheonil`

### 출시 전 변경은 OK

아직 Play Store 출시 안 한 시점이면 자유롭게 바꿔도 OK. 다만:
- EAS 가 새 앱으로 인식 → 새 키스토어 발급 prompt
- dev build / 기존 빌드와 packageId 충돌로 디바이스 동시 설치 불가 → 기존 앱 삭제 후 새 빌드 설치

### dev build / production build 동시 설치 불가

같은 `applicationId` 라 한 디바이스에 한쪽만. 한쪽 지우고 다른 쪽 설치. 둘 다 유지하고 싶으면 `applicationIdSuffix` 로 dev 만 다른 패키지명 (`com.ban.cheonil.dev` 등) — 다만 위젯 deep link 도 따라 바뀌어야 하므로 신중.

---

## 12. 출시 노트 (Release notes) 작성

Play Console 의 "이번 버전의 새로운 기능" 노트. 언어당 **최대 500자**.

### 첫 출시 (1.0.0) 예시

```
첫 공개 버전입니다.

전화로 들어온 주문을 받아 적는 대신
음성으로 즉시 등록하는 도구입니다.

"강남점, 양념치킨 두 개"
이렇게 말씀하시면 자동으로 주문이 생성돼요.

✨ 사용 팁
· 홈 화면에 "음성 주문" 위젯 추가 → 탭 한 번으로 녹음
· 또박또박 발음할수록 정확도 ↑
· 잘못 들렸으면 다시 녹음하면 됩니다
```

### 이후 업데이트 톤

```
v1.1.0
· 음성 인식 정확도 개선
· 위젯 디자인 정돈
· 작은 버그 수정
```

가족 매장 내부 테스트면 친근한 톤 OK. 공개 출시로 확장하면 더 미니멀한 변경사항 나열 톤 권장.

---

## 참고

- [Expo Dev Client](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build](https://docs.expo.dev/build/setup/)
- [EAS Build profiles](https://docs.expo.dev/eas/json/)
- [react-native-android-widget](https://github.com/sAleksovski/react-native-android-widget)
- [Google Play 데이터 안전성](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Play Console 내부 테스트](https://support.google.com/googleplay/android-developer/answer/9845334)
