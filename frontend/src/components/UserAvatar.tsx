import { cn } from '../lib/utils'

interface UserAvatarProps {
  name: string
  photo?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 rounded-xl text-xs',
  md: 'h-10 w-10 rounded-2xl text-sm',
  lg: 'h-14 w-14 rounded-2xl text-xl',
}

export function UserAvatar({ name, photo, size = 'md', className }: UserAvatarProps) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        title={name}
        className={cn('shrink-0 object-cover', sizeClasses[size], className)}
      />
    )
  }

  return (
    <div
      title={name}
      className={cn(
        'flex shrink-0 items-center justify-center bg-brand/10 font-black text-brand',
        sizeClasses[size],
        className,
      )}
    >
      {initials}
    </div>
  )
}
