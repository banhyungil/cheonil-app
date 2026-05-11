import { Link, Stack } from 'expo-router'
import { Text, View } from 'react-native'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5 bg-white dark:bg-slate-900">
        <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          This screen does not exist.
        </Text>
        <Link href="/voice-order" className="mt-4">
          <Text className="text-base text-emerald-600 dark:text-emerald-400">
            홈으로 이동
          </Text>
        </Link>
      </View>
    </>
  )
}
