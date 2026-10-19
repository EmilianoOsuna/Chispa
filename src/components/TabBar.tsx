import { Link, useLocation } from 'react-router'
import { Icon, type IconName } from './Icon'

const TABS: { to: string; label: string; icon: IconName; active: string; match: (p: string, h: string) => boolean }[] = [
  { to: '/', label: 'Hoy', icon: 'flame', active: 'text-flame-deep', match: (p) => p === '/' },
  { to: '/nosotros', label: 'Nosotros', icon: 'people', active: 'text-sky-ink', match: (p, h) => p === '/nosotros' && h !== '#logros' },
  { to: '/nosotros#logros', label: 'Logros', icon: 'trophy', active: 'text-flame-deep', match: (p, h) => p === '/nosotros' && h === '#logros' },
  { to: '/perfil', label: 'Perfil', icon: 'user', active: 'text-sky-ink', match: (p) => p === '/perfil' },
]

export function TabBar() {
  const { pathname, hash } = useLocation()
  return (
    <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-20 mx-auto grid max-w-[430px] grid-cols-4 border-t-2 border-line bg-white px-2 pt-2"
      style={{ paddingBottom: 'max(18px, env(safe-area-inset-bottom))' }}>
      {TABS.map((t) => {
        const on = t.match(pathname, hash)
        return (
          <Link key={t.label} to={t.to} aria-current={on ? 'page' : undefined}
            className={`flex flex-col items-center gap-0.5 py-1.5 text-xs no-underline ${on ? `${t.active} font-extrabold` : 'font-bold text-muted'}`}>
            <Icon name={t.icon} size={26} stroke={on ? 2.4 : 2.2} />
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}
