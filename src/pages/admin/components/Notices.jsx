import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function Notices() {
  return (
    <div className="space-y-4">
      <Input placeholder="Notice Title" />
      <Textarea placeholder="Notice Content" />
      <Input type="file" />
      <Input placeholder="Link URL" />
      <Button>Post Notice</Button>
    </div>
  )
}

