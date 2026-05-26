import { redirect } from 'next/navigation'

// 루트 경로 접근 시 로그인 페이지로 리디렉션
export default function Home() {
  redirect('/login')
}
