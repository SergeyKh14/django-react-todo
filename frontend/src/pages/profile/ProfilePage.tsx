import { ProfileCard } from './components/ProfileCard'
import { ProfileForm } from './components/ProfileForm'
import { AvatarUpload } from './components/AvatarUpload'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function ProfilePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex flex-col items-center gap-4">
          <AvatarUpload />
          <ProfileCard />
        </div>
        <Card className="flex-1">
          <CardHeader>
            <h2 className="text-lg font-semibold">Edit profile</h2>
          </CardHeader>
          <CardContent>
            <ProfileForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
