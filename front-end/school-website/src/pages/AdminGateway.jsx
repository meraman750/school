import { useEffect } from 'react'
import { DASHBOARD_ACCESS_KEY, getDashboardLoginUrl } from '../utils/constants'

export default function AdminGateway() {
  useEffect(() => {
    sessionStorage.setItem(DASHBOARD_ACCESS_KEY, '1')
    window.location.replace(getDashboardLoginUrl())
  }, [])

  return null
}
