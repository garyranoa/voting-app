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
    <Text className="votingText"><p>Pick a word for Voting option</p></Text>
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
    <Group position="center" spacing="md" grow align="center" className="entryBtns mt-4">
      <Button className="customBtn1" onClick={() => updateWord(sessionId, roundNumber)}>New Option</Button>
      <Button className="customBtn2" onClick={() => updateRoundState(sessionId, roundNumber, ROUND_STATES.GUESSING)}>Confirm Option</Button>
    </Group>
  );
}

function GuesserWaitScreen() {
  return (
    <Text className="votingInfo" italic><p>Waiting for the dasher to either confirm or reject the voting option...</p></Text>
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
      <Title className="voteOption">Voting Option Selection</Title>
      {isDasher ? <DasherCaption /> : <GuesserCaption />}
      <br />
      <Card className="votersCard">
        <Title size="h3"></Title>
        <Title className="votersFeature mb-4">Feature #{options[0].id}</Title>
        <Title className="votersRef mb-4">{options[0].title}</Title>
        <Text className="votersDescription" dangerouslySetInnerHTML={{ __html: options[0].description }}></Text>
        {isDasher ? (
          <DasherControls sessionId={sessionId} roundNumber={roundNumber} />
        ) : (
          <GuesserWaitScreen />
        )}
      </Card>      
    </>
  );
}
