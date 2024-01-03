import { useEffect, useState } from "react"
import { getAllSessions } from "../lib/firebase"

export default function useSessions() {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    ;(async function () {
      const rawAllSessions = await getAllSessions()
      if (rawAllSessions) {
        setSessions(rawAllSessions)
      }
    })()
  }, [])

  return { sessions }
}
