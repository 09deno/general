import { Dumbbell, Settings, TrendingUp, Utensils, type LucideIcon } from 'lucide-react'

export type Tab = {
  path: string
  label: string
  icon: LucideIcon
  description: string
}

export const tabs: Tab[] = [
  {
    path: '/jedlo',
    label: 'Jedlo',
    icon: Utensils,
    description: 'Tu si budeš zapisovať jedlo a uvidíš, koľko kalórií ti ešte zostáva.',
  },
  {
    path: '/trening',
    label: 'Tréning',
    icon: Dumbbell,
    description: 'Tu si budeš zapisovať tréningy – cviky, série, opakovania aj šport.',
  },
  {
    path: '/progres',
    label: 'Progres',
    icon: TrendingUp,
    description: 'Tu uvidíš grafy, osobné rekordy a týždenný súhrn.',
  },
  {
    path: '/nastavenia',
    label: 'Nastavenia',
    icon: Settings,
    description: 'Tu si upravíš svoje ciele a profil.',
  },
]
