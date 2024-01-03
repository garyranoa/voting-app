import Head from "next/head"
import { Text, Paper } from "@mantine/core"
import SelectionButton from "../../../components/buttons/SelectionButton"
import { useState } from "react"
import { Table } from "@mantine/core"
import useSessions from "../../../hooks/useSessions"
import { useRouter } from "next/router"
import Link from "next/link"
import { TextInput } from "@mantine/core"

export default function SessionsDashboard() {
  const router = useRouter()

  const [search, setSearch] = useState("")
  const { sessions } = useSessions()
  const rows = Object.keys(sessions).map((key) => {
    const element = sessions[key]
    if (element) {
      const query = element.id && element.id.startsWith(search)
      const query2 = element.state && element.state.startsWith(search) 
      const query3 = element.creator && element.creator.startsWith(search) 
      if (query || query2 || query3 || !search) {
        return (
          <tr key={element.id}>
            <td>
              <Link
                href={`/dashboard/sessions/${element.id}`}
                passHref
                scroll={false}
              >
                <a>{element.id}</a>
              </Link>
            </td>
            <td>{element.state}</td>
            <td>{element.creator}</td>
            <td>...</td>
          </tr>
        )
      }
    }
  })

  return (
    <div>
      <main>
        <div className="votingWrap">
          <h1 className="mt-3 mb-3">Sessions</h1>
          <TextInput
            placeholder="Search"
            label="Search session"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />
          <Table className="Dashboard-Sessions-Table">
            <thead>
              <tr>
                <th>ID</th>
                <th>State</th>
                <th>Creator</th>
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
