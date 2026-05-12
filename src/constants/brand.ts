/**
 * 천일식당 브랜드 디자인 토큰.
 *
 * - Next 프로젝트 (`cheonil-restaurant-next/src/style/preset.ts`) 와 동일 팔레트
 * - NativeWind tailwind.config 의 `primary` 색상과 일치
 * - 위젯 (RemoteViews) 처럼 className 못 쓰는 곳에서 hex 직접 참조용
 */
export const BRAND = {
  primary: {
    50: '#E9F5EF',
    100: '#C9E8D6',
    200: '#A6D7B8',
    300: '#82C79A',
    400: '#67BC89',
    500: '#4FB395',
    600: '#3F9478',
    700: '#2F755C',
    800: '#1F5641',
    900: '#144432',
    950: '#0A2A1F',
  },
} as const
