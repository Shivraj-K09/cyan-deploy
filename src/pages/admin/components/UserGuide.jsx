import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function UserGuide() {
  return (
    <div className="space-y-4">
      <Input placeholder="Guide Title" />
      <Textarea placeholder="Guide Content" />
      <Input type="file" />
      <Input placeholder="Link URL" />
      <Button>Post Guide</Button>
    </div>
  )
}

