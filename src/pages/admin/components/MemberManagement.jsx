import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { motion } from "framer-motion"

const memberData = [
  { id: 1, name: "John Doe", email: "john@example.com", level: "Gold" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", level: "Supporter" },
  { id: 3, name: "Alice Johnson", email: "alice@example.com", level: "Free" },
  { id: 4, name: "Bob Williams", email: "bob@example.com", level: "Paid" },
]

export function MemberManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [members, setMembers] = useState(memberData)

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.level.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleMessage = (id) => {
    console.log(`Messaging member with id: ${id}`)
  }

  const handleEdit = (id) => {
    console.log(`Editing member with id: ${id}`)
  }

  const handleBlock = (id) => {
    setMembers(members.filter((member) => member.id !== id))
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex space-x-2">
        <Input placeholder="Search members..." className="max-w-sm" value={searchTerm} onChange={handleSearch} />
        <Button>Search</Button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Name</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Email</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Membership Level</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow
                key={member.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <TableCell className="font-medium text-gray-900 dark:text-gray-100">{member.name}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{member.email}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{member.level}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleMessage(member.id)}>
                    Message
                  </Button>
                  <Button variant="outline" size="sm" className="ml-2" onClick={() => handleEdit(member.id)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" className="ml-2" onClick={() => handleBlock(member.id)}>
                    Block
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  )
}

