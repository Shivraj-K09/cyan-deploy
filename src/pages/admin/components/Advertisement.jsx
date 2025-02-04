import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Advertisement() {
  return (
    <div className="space-y-4">
      <Input placeholder="Advertisement Title" />
      <Input type="file" />
      <Input placeholder="Link URL" />
      <Button>Upload Advertisement</Button>
    </div>
  )
}

