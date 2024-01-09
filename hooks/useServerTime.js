import { getServerTimestamp } from "../lib/firebase"
import { useEffect, useState } from "react"
import moment from "moment"

export default function useServerTime() {
  const [serverTime, setServerTime] = useState("")
  useEffect(() => {
    const _serverTime = getServerTimestamp()
    setServerTime(_serverTime)
    // var intervalId1 = setInterval(() => {
    //   const _serverTime = getServerTimestamp()
    //   setServerTime(_serverTime)
    // }, 1000)

    // return () => {
    //   clearInterval(intervalId1)
    // }
  }, [])

  const serverTimeComponent = (
    <div className="text-center">
      <span>{moment(serverTime).toLocaleString()}</span>
    </div>
  )
  return { serverTimeComponent }
}
