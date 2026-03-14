import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AvatarUploadProps {
  className?: string
  /** Placeholder when no image URL */
  imageUrl?: string | null
  onFileSelect?: (file: File) => void
}

export function AvatarUpload({ className, imageUrl, onFileSelect }: AvatarUploadProps) {
  return (
    <div
      className={cn(
        'relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-muted',
        className
      )}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="Avatar" className="h-full w-full object-cover" />
      ) : (
        <User className="h-12 w-12 text-muted-foreground" />
      )}
      {onFileSelect && (
        <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity hover:opacity-100">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onFileSelect(file)
            }}
          />
          <span className="text-xs text-white">Upload</span>
        </label>
      )}
    </div>
  )
}
