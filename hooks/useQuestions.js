import { useEffect, useState } from "react"
import { getAllImportedQuestions } from "../lib/firebase"

export default function useQuestions() {
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    ;(async function () {
      const rawAllQuestions = await getAllImportedQuestions()
      const allQuestions = rawAllQuestions.filter((f) => !!f)
      const rawQuestionsData = allQuestions[allQuestions.length - 1]._data
      const _questions = Object.values(rawQuestionsData)
      setQuestions(_questions)
    })()
  }, [])

  return { questions }
}
