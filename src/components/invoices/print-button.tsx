'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-md bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
    >
      PDF 저장
    </button>
  )
}
