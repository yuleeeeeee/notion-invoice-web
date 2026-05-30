import { AdminHeader } from '@/components/invoices/admin-header'

export default function InvoicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <AdminHeader />
      <main>{children}</main>
    </div>
  )
}
