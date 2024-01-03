import { useEffect, useState } from "react"
import { getSessionValue } from "../lib/firebase"

export default function useSession({ id }) {
  const [session, setSession] = useState()

  useEffect(() => {
    if (id) {
      ;(async function () {
        const rawSession = await getSessionValue(id)
        if (rawSession) {
          setSession(rawSession)
        }
      })()
    }
  }, [id])

  return { session }
}
