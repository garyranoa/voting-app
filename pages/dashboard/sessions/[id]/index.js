import Head from "next/head"
import {
  Button,
  Text,
  Paper,
  Center,
  Box,
  Modal,
  ScrollArea,
} from "@mantine/core"
import SelectionButton from "../../../../components/buttons/SelectionButton"
import { useState, useEffect } from "react"
import { Table } from "@mantine/core"
import useSessions from "../../../../hooks/useSessions"
import { useRouter } from "next/router"
import Link from "next/link"
import useSession from "../../../../hooks/useSession"
import VoterMenu from "../../../../components/admin/voterMenu"
import { BiUpvote } from "react-icons/bi"
import {
  updateUserVote,
  deleteUserVote,
  syncSession,
} from "../../../../lib/firebase"

function Voter({ session, roundNumber, voter, vote }) {
  const sessionId = session.id
  const [showVoteOption, setShowVoteOption] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const options =
    session && session.defaultOptions ? session.defaultOptions : []
  console.log("session", session)
  const modifyHandler = () => {
    setShowVoteOption(true)
  }
  const deleteHandler = () => {
    setShowConfirmDelete(true)
  }

  // const options = sortBy(
  //   Object.keys(votes)
  //     .filter((user) => !votes[user].correct)
  //     .map((user) => ({
  //       owner: user,
  //       definition: votes[user].guess,
  //       votes: votes[user].hasOwnProperty("votes")
  //         ? Object.keys(votes[user].votes)
  //         : [],
  //     }))
  //     .concat(
  //       Array({
  //         owner: TRUE_DEFINITION,
  //         definition: definition,
  //         votes: trueDefinitionVoters,
  //       })
  //     ),
  //   "definition"
  // );

  const modifyModal = showVoteOption && (
    <>
      <Modal
        title={""}
        scrollAreaComponent={ScrollArea.Autosize}
        opened={showVoteOption}
        onClose={() => setShowVoteOption(false)}
        closeOnClickOutside={true}
        closeOnEscape={true}
        withCloseButton={true}
        closeOnConfirm={true}
        closeOnCancel={true}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 6,
        }}
        size="sm"
      >
        Voter: {voter}
        <div
          style={{
            paddingTop: "10px",
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: "200px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {options &&
            options.map((item, i) => (
              <Button
                key={i}
                color={i % 2 ? "red" : "blue"}
                variant="filled"
                radius="md"
                mt="xl"
                mb="xl"
                mr="xs"
                uppercase
                onClick={() => {
                  updateUserVote(sessionId, roundNumber, voter, {
                    id: i,
                    name: item,
                  })
                  setShowVoteOption(false)
                }}
              >
                <Center>
                  <BiUpvote size={25} />
                  <Box ml={10}>{item}</Box>
                </Center>
              </Button>
            ))}
        </div>
      </Modal>
    </>
  )

  const confirmDeleteModal = showConfirmDelete && (
    <>
      <Modal
        title={""}
        scrollAreaComponent={ScrollArea.Autosize}
        opened={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        closeOnClickOutside={true}
        closeOnEscape={true}
        withCloseButton={true}
        closeOnConfirm={true}
        closeOnCancel={true}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 6,
        }}
        size="sm"
      >
        Voter: {voter}
        <div
          style={{
            paddingTop: "10px",
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: "200px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button
            color={"blue"}
            variant="filled"
            radius="md"
            mt="xl"
            mb="xl"
            mr="xs"
            uppercase
            onClick={() => {
              deleteUserVote(sessionId, roundNumber, voter, {
                id: i,
                name: item,
              })
              setShowConfirmDelete(false)
            }}
          >
            <Center>
              <BiUpvote size={25} />
              <Box ml={10}>DELETE</Box>
            </Center>
          </Button>
          <Button
            color={"red"}
            variant="filled"
            radius="md"
            mt="xl"
            mb="xl"
            mr="xs"
            uppercase
            onClick={() => {
              setShowConfirmDelete(false)
            }}
          >
            <Center>
              <BiUpvote size={25} />
              <Box ml={10}>CANCEL</Box>
            </Center>
          </Button>
        </div>
      </Modal>
    </>
  )
  return (
    <tr key={voter}>
      <td>
        <Link href={`/dashboard/player/${voter}`} passHref>
          <a>{voter}</a>
        </Link>
      </td>
      <td>{vote}</td>
      <td>
        {modifyModal}
        {confirmDeleteModal}
        <VoterMenu
          modifyHandler={modifyHandler}
          deleteHandler={deleteHandler}
        />
      </td>
    </tr>
  )
}
export default function SessionDashboard() {
  const router = useRouter()
  const { id } = router.query

  const [session, setSessionData] = useState()

  useEffect(() => {
    if (id) {
      syncSession(id, setSessionData)
    }
  }, [id])

  const [rows, setRows] = useState([])
  useEffect(() => {
    if (session) {
      const rounds =
        session && session.rounds && session.rounds.length > 0
          ? session.rounds.filter((f) => !!f)
          : []
      const firstRound = rounds && rounds.length > 0 ? rounds[0] : []
      const voters =
        firstRound && firstRound.votes ? Object.keys(firstRound.votes) : []
      const _rows = voters.map((r) => {
        const voteObj = firstRound.votes[r]
        const voter = r
        const vote = voteObj.vote
        return (
          <Voter
            key={voter}
            session={session}
            roundNumber={firstRound.number}
            voter={voter}
            vote={vote}
          />
        )
      })

      setRows(_rows)
    }
  }, [session])

  return (
    <div>
      <main>
        <div className="votingWrap">
          <h1 className="mt-3 mb-3">Backlog Voting ({id})</h1>

          <Table className="Dashboard-Sessions-Table">
            <thead>
              <tr>
                <th>Voter</th>
                <th>Vote</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>

          <SelectionButton
            className="customBtn"
            content="BACK TO SESSIONS"
            onClick={() =>
              router.push("/dashboard/sessions", undefined, {
                scroll: false,
              })
            }
          />
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
