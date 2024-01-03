import Head from "next/head"
import { Text, Paper } from "@mantine/core"
import SelectionButton from "../../components/buttons/SelectionButton"
import { useState } from "react"
import { useRouter } from "next/router"

export default function Dashboard() {
  const router = useRouter()
  return (
    <div>
      <main>
        <div className="votingWrap">
          <h1 className="mt-3 mb-3">Dashboard</h1>
          <SelectionButton
            className="customBtn"
            content="SESSIONS"
            onClick={() => router.push('/dashboard/sessions')}
          />
          <SelectionButton
            className="customBtn"
            content="QUESTIONS"
            onClick={() => router.push('/dashboard/questions')}
          />
          <SelectionButton
            className="customBtn"
            content="STATS"
            onClick={() => {}}
          />
          <SelectionButton
            className="customBtn"
            content="PLAYERS"
            onClick={() => {}}
          />
        </div>

        <Paper className="votingText mt-4">
          <Text size="md">Navigate</Text>
        </Paper>
      </main>
    </div>
  )
}
