import { AdminHeader } from '@/components/invoices/admin-header'
import { requireSession } from '@/lib/auth'

export default async function InvoicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSession()

  return (
    <div className="min-h-screen">
      <AdminHeader email={session.adminEmail} />
      <main>{children}</main>
    </div>
  )
}
