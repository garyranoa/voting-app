import { useEffect, useRef, useState } from "react"
import { CountdownCircleTimer } from "react-countdown-circle-timer"
import { getServerTimestamp } from "../lib/firebase"

const RenderTime = ({ remainingTime }) => {
  const currentTime = useRef(remainingTime)
  const prevTime = useRef(null)
  const isNewTimeFirstTick = useRef(false)
  const [, setOneLastRerender] = useState(0)

  if (currentTime.current !== remainingTime) {
    isNewTimeFirstTick.current = true
    prevTime.current = currentTime.current
    currentTime.current = remainingTime
  } else {
    isNewTimeFirstTick.current = false
  }
  // force one last re-render when the time is over to tirgger the last animation
  if (remainingTime === 0) {
    setTimeout(() => {
      setOneLastRerender((val) => val + 1)
    }, 20)
  }

  const isTimeUp = isNewTimeFirstTick.current

  return (
    <div className="time-wrapper">
      <div key={remainingTime} className={`time ${isTimeUp ? "up" : ""}`}>
        {remainingTime}
      </div>
      {prevTime.current !== null && (
        <div
          key={prevTime.current}
          className={`time ${!isTimeUp ? "down" : ""}`}
        >
          {prevTime.current}
        </div>
      )}
    </div>
  )
}

export default function useRoundTimer({ endAt, show }) {
  const [timeLeft, setTimeLeft] = useState()

  useEffect(() => {
    // endAt should be calculated using current datetime + round duration
    if (endAt) {
      const date1 = new Date(endAt)
      const serverTime = getServerTimestamp()
      const date2 = new Date(serverTime)
      const diff = date1.getTime() - date2.getTime()
      const msec = diff
      // const hh = Math.floor(msec / 1000 / 60 / 60)
      // const mm = Math.floor(msec / 1000 / 60)
      const ss = Math.floor(msec / 1000)
      setTimeLeft(ss)
    }
  }, [endAt])
  
  const theTimerComponent =
    timeLeft && show ? (
      <div className="timer-wrapper">
        <CountdownCircleTimer
          isPlaying
          size={150}
          duration={timeLeft}
          colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
          colorsTime={[10, 6, 3, 0]}
          onComplete={() => {
            setTimeLeft(0)
            return { shouldRepeat: false, delay: 1.5 }
          }}
        >
          {RenderTime}
        </CountdownCircleTimer>
      </div>
    ) : (
      <></>
    )

  return [timeLeft, setTimeLeft, theTimerComponent]
}
