import { Card, List, ThemeIcon, Title, Text } from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons";
import SelectionButton from "../buttons/SelectionButton";
import { MIN_PLAYERS } from "../../lib/constants";
import cookieCutter from "cookie-cutter";
import { startSession } from "../../lib/firebase";
import ErrorDialog from "../errors/ErrorDialog";
import { useState } from "react";
import { displayError } from "../errors/ErrorMessage";

const cardStyle = {
  maxWidth: "350px",
  marginLeft: "auto",
  marginRight: "auto",
  textAlign: "left",
};

const cardTitleStyle = {
  textAlign: "center",
  paddingBottom: "20px",
  marginBottom: "20px",
  borderBottom: "1px solid grey",
};

const listStyle = {
  marginLeft: "auto",
  marginRight: "auto",
};

async function handleSessionStart(sessionId, setErrorVisible, setErrorMessage) {
  const response = await startSession(sessionId);
  if (response != undefined)
    displayError(response, setErrorVisible, setErrorMessage);
}

function JoinedIcon() {
  return (
    <ThemeIcon color="teal" size={24} radius="xl">
      <IconCircleCheck size={16} />
    </ThemeIcon>
  );
}

function UserList(props) {
  return props.voters.length === 0 ? (
    <Title size="h2">No voters yet</Title>
  ) : (
    <List spacing="xs" style={listStyle} icon={<JoinedIcon />}>
      {props.voters.map((p) => (
        <List.Item key={p}>{p}</List.Item>
      ))}
    </List>
  );
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
        <p style={{ textAlign: "center", color: "red" }}>
          You need at least {MIN_PLAYERS} voters to start
        </p>
      )}
    </>
  );
}

function WaitForStart() {
  return (
    <Text
      style={{
        textAlign: "center",
        fontStyle: "italic",
        borderTop: "1px solid grey",
        paddingTop: "15px",
      }}
    >
      Waiting for the host to open the voting
    </Text>
  );
}

export default function Lobby({ sessionData }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);
  const { id, voters, creator } = sessionData;
  const voterList = Object.keys(voters);
  return (
    <>
      <Title size="h1" style={{ paddingTop: "20px", paddingBottom: "20px" }}>
        New Game
      </Title>
      <Text ml="auto" mr="auto" style={{ maxWidth: "350px" }}>
        Invite your friends to join the game via session ID:
        <strong> {id}</strong>
      </Text>
      <p>New Voters will appear in the below list</p>
      <br />
      <Card shadow="lg" radius="md" withBorder style={cardStyle}>
        <Title size="h2" style={cardTitleStyle}>
          Voters
        </Title>
        <UserList voters={voterList.filter((p) => p != creator)} />
        <br />
        {cookieCutter.get("username") === creator
          ? PlayButton(
              id,
              voterList.filter((p) => p != creator).length  >= MIN_PLAYERS,
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
  );
}
