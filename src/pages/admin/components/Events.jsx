import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"

export function Events() {
  const [eventTitle, setEventTitle] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [eventLink, setEventLink] = useState("")
  const [file, setFile] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ eventTitle, eventDescription, eventLink, file })
    // Here you would typically send this data to your backend
  }

  return (
    <motion.div
      className="space-y-4 max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Create New Event</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="eventTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Event Title
            </label>
            <Input
              id="eventTitle"
              placeholder="Enter event title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="eventDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Event Description
            </label>
            <Textarea
              id="eventDescription"
              placeholder="Enter event description"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="eventImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Event Image
            </label>
            <Input
              id="eventImage"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
          </div>
          <div>
            <label htmlFor="eventLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Event Link
            </label>
            <Input
              id="eventLink"
              placeholder="Enter event link URL"
              value={eventLink}
              onChange={(e) => setEventLink(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" className="mt-6 w-full">
          Post Event
        </Button>
      </form>
    </motion.div>
  )
}

