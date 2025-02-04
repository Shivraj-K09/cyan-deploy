import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function CustomerCenter() {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Inquiry</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Jane Doe</TableCell>
            <TableCell>How do I reset my password?</TableCell>
            <TableCell>2023-06-01</TableCell>
            <TableCell>Pending</TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                Respond
              </Button>
              <Button variant="destructive" size="sm" className="ml-2">
                Delete
              </Button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>John Smith</TableCell>
            <TableCell>I can't access my account</TableCell>
            <TableCell>2023-06-02</TableCell>
            <TableCell>In Progress</TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                Respond
              </Button>
              <Button variant="destructive" size="sm" className="ml-2">
                Delete
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

