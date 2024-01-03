import Head from "next/head"
import { Text, Paper } from "@mantine/core"
import SelectionButton from "../../../components/buttons/SelectionButton"
import { useState } from "react"
import { Table } from "@mantine/core"
import useQuestions from "../../../hooks/useQuestions"
import { useRouter } from "next/router"

export default function QuestionsDashboard() {
  const router = useRouter()
  const { questions } = useQuestions()
  const rows = questions.map((element) => (
    <tr key={element.id}>
      <td>{element.id}</td>
      <td>{element.title}</td>
      <td>
        <div dangerouslySetInnerHTML={{ __html: element.description }}></div>
      </td>
      <td>...</td>
    </tr>
  ))

  return (
    <div>
      <main>
        <div className="votingWrap">
          <h1 className="mt-3 mb-3">Questions</h1>

          <Table className="Dashboard-Questions-Table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>

          <SelectionButton
            className="customBtn"
            content="BACK TO DASHBOARD"
            onClick={() => router.push("/dashboard")}
          />
        </div>

        <Paper className="votingText mt-4">
          <Text size="md">Navigate</Text>
        </Paper>
      </main>
    </div>
  )
}
