import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboardClient from './AdminDashboardClient'

export default function AdminDashboardPage() {
  const adminToken = cookies().get('admin-token')?.value

  if (!adminToken) {
    redirect('/admin/login')
  }

  return <AdminDashboardClient />
}
