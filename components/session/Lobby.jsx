import { Card, List, ThemeIcon, Title, Text } from "@mantine/core"
import { IconCircleCheck } from "@tabler/icons"
import SelectionButton from "../buttons/SelectionButton"
import { MIN_PLAYERS } from "../../lib/constants"
import cookieCutter from "cookie-cutter"
import { startSession } from "../../lib/firebase"
import ErrorDialog from "../errors/ErrorDialog"
import { useState } from "react"
import { displayError } from "../errors/ErrorMessage"

const listStyle = {
  marginLeft: "auto",
  marginRight: "auto",
}

async function handleSessionStart(sessionId, setErrorVisible, setErrorMessage) {
  const response = await startSession(sessionId)
  if (response != undefined)
    displayError(response, setErrorVisible, setErrorMessage)
}

function JoinedIcon() {
  return (
    <ThemeIcon color="teal" size={24} radius="xl">
      <IconCircleCheck size={16} />
    </ThemeIcon>
  )
}

function UserList(props) {
  return props.voters.length === 0 ? (
    <h2>No voters yet</h2>
  ) : (
    <List className="votersList" icon={<JoinedIcon />}>
      {props.voters.map((p) => (
        <List.Item key={p}>{p}</List.Item>
      ))}
    </List>
  )
}

function PlayButton(sessionId, playable, setErrorVisible, setErrorMessage) {
  return (
    <>
      <SelectionButton
        content="Launch"
        disabled={!playable}
        onClick={() =>
          handleSessionStart(sessionId, setErrorVisible, setErrorMessage)
        }
      />
      {!playable && (
        <p className="votingInfo">
          You need at least {MIN_PLAYERS} voters to start
        </p>
      )}
    </>
  )
}

function WaitForStart() {
  return (
    <Text className="waitingInfo">Waiting for the host to open the voting</Text>
  )
}

export default function Lobby({ sessionData }) {
  const [errorMessage, setErrorMessage] = useState("")
  const [errorVisible, setErrorVisible] = useState(false)
  const { id, voters, creator } = sessionData
  const voterList = Object.keys(voters)
  return (
    <>
      <Title size="h1" className="votingTitle">
        New Game
      </Title>
      <Text className="votingText">
        <p>Invite your friends to join the game via</p>
        <p>
          <label>
            <strong>SESSION ID: {id}</strong>
          </label>
        </p>
      </Text>
      <div className="divider"></div>
      <Text className="votingText">
        <p className="mb-4" align="center">
          New Voters will appear in the below list
        </p>
      </Text>

      <Card className="votingCard">
        <Title size="h2">Voters</Title>
        <UserList
          voters={voterList.filter(
            (p) => p != creator && p.indexOf("spectator") < 0
          )}
        />
        <br />
        {cookieCutter.get("username") === creator
          ? PlayButton(
              id,
              voterList.filter((p) => p != creator).length >= MIN_PLAYERS,
              setErrorVisible,
              setErrorMessage
            )
          : WaitForStart()}
      </Card>
      <ErrorDialog
        opened={errorVisible}
        setOpened={setErrorVisible}
        title={"Server Error"}
        error={errorMessage}
      />
    </>
  )
}
