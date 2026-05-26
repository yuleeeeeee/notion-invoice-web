import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground mt-2 text-lg">
        견적서를 찾을 수 없습니다.
      </p>
      <p className="text-muted-foreground mt-1 text-sm">
        링크가 만료되었거나 잘못된 주소입니다.
      </p>
      <Link
        href="/"
        className="text-primary mt-6 text-sm underline-offset-4 hover:underline"
      >
        홈으로 이동
      </Link>
    </div>
  )
}
