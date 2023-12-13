/**
 * What users see when the state is in the "dasher" state
 */

import { Title, Text, Card, Group, Button } from "@mantine/core";
import cookieCutter from "cookie-cutter";
import { useEffect, useState } from "react";
import { getWordDefinition } from "../../lib/vocab";
import { updateRoundState, updateWord } from "../../lib/firebase";
import { ROUND_STATES } from "../../lib/constants";

const paddingSides = "20px";
const cardStyle = {
  maxWidth: "350px",
  marginLeft: "auto",
  marginRight: "auto",
};

function DasherCaption() {
  return (
    <Text
      mr="auto"
      ml="auto"
      style={{
        paddingLeft: paddingSides,
        paddingRight: paddingSides,
        maxWidth: "350px",
      }}
    >
      Pick a word for Voting option
    </Text>
  );
}

function GuesserCaption() {
  return (
    <Text
      mr="auto"
      ml="auto"
      style={{
        paddingLeft: paddingSides,
        paddingRight: paddingSides,
        maxWidth: "350px",
      }}
    >
      The dasher is picking a voting option.
    </Text>
  );
}

function DasherControls({ sessionId, roundNumber }) {
  return (
    <Group position="center" spacing="md" grow align="center" style={cardStyle}>
      <Button
        variant="outline"
        color="red"
        onClick={() => updateWord(sessionId, roundNumber)}
      >
        New Option
      </Button>
      <Button
        variant="filled"
        color="red"
        onClick={() =>
          updateRoundState(sessionId, roundNumber, ROUND_STATES.GUESSING)
        }
      >
        Confirm Option
      </Button>
    </Group>
  );
}

function GuesserWaitScreen() {
  return (
    <Text size="xs" italic>
      Waiting for the dasher to either confirm or reject the voting option...
    </Text>
  );
}

export default function SelectingState({
  sessionId,
  dasher,
  options,
  roundNumber,
}) {
  const isDasher = cookieCutter.get("username") === dasher;
  const [definition, setDefinition] = useState("");
  useEffect(() => {
    getWordDefinition(options)
      .then(setDefinition)
      .catch((error) =>
        console.log(`Error retrieving definition for word ${word}: ${error}`)
      );
  }, [options]);
  return (
    <>
      <Title size="h2">Voting Option Selection</Title>
      {isDasher ? <DasherCaption /> : <GuesserCaption />}
      <br />
      <Card shadow="lg" radius="md" withBorder style={cardStyle} mb="md">
        <Title size="h3" color="dimmed" mb="md">
          
        </Title>
        <Title size="h5" color="red.5" weight={800}>
          Feature #{options[0].id}
        </Title>
        <Title size="h3" color="blue.5" weight={800}>
          {options[0].title}
        </Title>
        <Title size="sm" italic dangerouslySetInnerHTML={{ __html: options[0].description }}>
            
          </Title>
        
      </Card>
      {isDasher ? (
        <DasherControls sessionId={sessionId} roundNumber={roundNumber} />
      ) : (
        <GuesserWaitScreen />
      )}
    </>
  );
}
