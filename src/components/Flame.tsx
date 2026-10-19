// Mascota del diseño: llama naranja exterior + llama interior, con cara según el ánimo.
const OUTER = 'M50 4 C62 28 88 44 88 76 C88 100 70 116 50 116 C30 116 12 100 12 76 C12 58 22 46 30 38 C30 52 36 60 44 62 C40 40 44 22 50 4 Z'
const INNER = 'M50 52 C58 66 70 74 70 90 C70 104 61 112 50 112 C39 112 30 104 30 92 C30 82 36 76 40 72 C41 80 45 84 49 84 C47 72 47 62 50 52 Z'

type Mood = 'logo' | 'idle' | 'happy' | 'scared'

const ANIM: Record<Mood, string> = { logo: '', idle: 'respira', happy: 'flama', scared: 'tiembla' }
const LABEL: Record<Mood, string | undefined> = {
  logo: undefined, idle: 'Llama de la racha', happy: 'Llama de la racha compartida', scared: 'Llama asustada',
}

export function Flame({ mood = 'idle', width = 84 }: { mood?: Mood; width?: number }) {
  const inner = mood === 'happy' ? '#14213D' : mood === 'logo' ? '#2563EB' : '#3B82F6'
  const label = LABEL[mood]
  return (
    <svg width={width} height={width * 1.2} viewBox="0 0 100 120" className={ANIM[mood]}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}>
      <path d={OUTER} fill="#FF8A2A" />
      <path d={INNER} fill={inner} />
      {mood === 'idle' && (<>
        <circle cx="42" cy="88" r="4" fill="#14213D" />
        <circle cx="58" cy="88" r="4" fill="#14213D" />
      </>)}
      {mood === 'happy' && (<>
        <path d="M38 86 q4 -6 8 0" stroke="#FFFFFF" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M54 86 q4 -6 8 0" stroke="#FFFFFF" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M44 96 q6 6 12 0" stroke="#FF8A2A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </>)}
      {mood === 'scared' && (<>
        <circle cx="42" cy="86" r="5" fill="#FFFFFF" />
        <circle cx="58" cy="86" r="5" fill="#FFFFFF" />
        <circle cx="42" cy="87" r="2.4" fill="#14213D" />
        <circle cx="58" cy="87" r="2.4" fill="#14213D" />
        <ellipse cx="50" cy="100" rx="4" ry="5" fill="#14213D" />
        <path d="M74 48 q4 8 0 12 q-4 -4 0 -12z" fill="#8DB4FF" />
      </>)}
    </svg>
  )
}
