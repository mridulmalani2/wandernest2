import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboardClient from './AdminDashboardClient'
import { verifyToken } from '@/lib/auth'

export default function AdminDashboardPage() {
  const cookieStore = cookies()
  const adminToken = cookieStore.get('admin-token')?.value

  if (!adminToken) {
    redirect('/admin/login')
  }

  // Validate token integrity
  const payload = verifyToken(adminToken)
  if (!payload || typeof payload === 'string' || !(payload as any).adminId) {
    redirect('/admin/login')
  }

  return <AdminDashboardClient />
}
