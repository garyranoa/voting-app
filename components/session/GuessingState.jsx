import cookieCutter from "cookie-cutter";
import {
  Button,
  Card,
  Center,
  SegmentedControl,
  Text,
  Textarea,
  Title,
  Box,
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons";
import { BiDislike, BiLike, BiSolidDislike, BiSolidLike  } from "react-icons/bi";
import ReAct, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { MAX_DEF_LEN, MIN_DEF_LEN, ROUND_STATES } from "../../lib/constants";
import {
  updateRoundState,
  updateUserGuess,
  updateUserIsCorrect,
  updateUserVote,
} from "../../lib/firebase";
import { getWordDefinition } from "../../lib/vocab";
import { CountdownCircleTimer } from 'react-countdown-circle-timer'


function GuesserEntryView({ sessionId, roundNumber }) {
  const [definition, setDefinition] = useState("");
  const invalidDefinition =
    definition.length < MIN_DEF_LEN || definition.length > MAX_DEF_LEN;
  return (
    <>
      <Textarea
        placeholder="Your definition..."
        value={definition}
        onChange={(event) => setDefinition(event.currentTarget.value)}
        ml="auto"
        mr="auto"
        minRows={3}
        style={{ maxWidth: "500px" }}
      />
      <Button
        variant="filled"
        color="red.8"
        radius="md"
        mt="xl"
        mb="xl"
        uppercase
        disabled={invalidDefinition}
        onClick={() =>
          updateUserGuess(
            sessionId,
            roundNumber,
            cookieCutter.get("username"),
            definition.charAt(0).toUpperCase() + definition.slice(1)
          )
        }
      >
        Submit
        {invalidDefinition}
      </Button>
      {invalidDefinition && (
        <Text italic>
          Definition must be between {MIN_DEF_LEN} and {MAX_DEF_LEN} characters
        </Text>
      )}
    </>
  );
}

function GuesserEntryViewOptions({ sessionId, roundNumber }) {
  const [definition, setDefinition] = useState("");
  const invalidDefinition =
    definition.length < MIN_DEF_LEN || definition.length > MAX_DEF_LEN;
    const disabled = false
  return (
    <>
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
          <Button color="red" variant="filled" radius="md" mt="xl" mb="xl" uppercase
            disabled={disabled}
            onClick={() =>
              updateUserVote(sessionId,roundNumber,cookieCutter.get("username"), 'KILL')
            }>
            <Center><BiDislike size={25} /><Box ml={10}>KILL</Box></Center>
          </Button> &nbsp;
          <Button color="blue" variant="filled" radius="md" mt="xl" mb="xl" uppercase
          disabled={disabled}
          onClick={() =>
            updateUserVote(sessionId,roundNumber,cookieCutter.get("username"), 'KEEP')
          }>
            <Center><BiLike size={25} /><Box ml={10}>KEEP</Box></Center>
          </Button>
        </div>
    </>
  );
}

function VoterWaitView({ guess }) {
  return (
    <>
      <Title size="h4" mt="md" mb="xl" italic>
        {guess}
      </Title>
      <Text pl="lg" pr="lg">
        You have already submitted your answer, please wait for the others
      </Text>
    </>
  );
}

const RenderTime = ({ remainingTime }) => {
  const currentTime = useRef(remainingTime);
  const prevTime = useRef(null);
  const isNewTimeFirstTick = useRef(false);
  const [, setOneLastRerender] = useState(0);

  if (currentTime.current !== remainingTime) {
    isNewTimeFirstTick.current = true;
    prevTime.current = currentTime.current;
    currentTime.current = remainingTime;
  } else {
    isNewTimeFirstTick.current = false;
  }

  // force one last re-render when the time is over to tirgger the last animation
  if (remainingTime === 0) {
    setTimeout(() => {
      setOneLastRerender((val) => val + 1);
    }, 20);
  }

  const isTimeUp = isNewTimeFirstTick.current;

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
  );
};

function VoterView(sessionId, word, votes, roundNumber, timer) {
  const guess = guesses[cookieCutter.get("username")].guess;
  
  return (
    
    <div style={{ paddingLeft: "10px", paddingRight: "10px" }}>
      <div className="timer-wrapper">
          <CountdownCircleTimer
            isPlaying
            size={150}
            duration={timer}
            colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
            colorsTime={[10, 6, 3, 0]}>
          {RenderTime}
        </CountdownCircleTimer>
      </div>
      
      <Title size="h2">Vote the following word</Title>
      <Title color="red.8" pt="xl" pb="xl" transform="uppercase">
        {word}
      </Title>
      {guess.length > 0 ? (
        <VoterWaitView guess={guess} />
      ) : (
        <GuesserEntryViewOptions sessionId={sessionId} roundNumber={roundNumber} />
      )}
    </div>
  );
}

function submissionHandler(sessionId, roundNumber, guesses) {
  Object.keys(guesses).forEach((user) => {
    if (guesses[user].correct) {
      updateUserIsCorrect(sessionId, roundNumber, user).catch((error) =>
        console.log(error)
      );
    }
  });
  updateRoundState(sessionId, roundNumber, ROUND_STATES.VOTING).catch((error) =>
    console.log(error)
  );
}

function GuessCard({ guesses }) {
  return Object.keys(guesses).map((user, index) => {
    const guess = guesses[user].guess;
    const waiting = guess.length == 0;
    return (
      <Card
        key={index}
        shadow="xl"
        radius="md"
        mt="lg"
        mb="lg"
        withBorder
        style={{
          maxWidth: "350px",
          marginLeft: "auto",
          marginRight: "auto",
          padding: "5px",
        }}
      >
        <Text size="xs" align="left" color="dimmed" pb="xs">
          {user}
        </Text>
        <Text color={waiting ? "dimmed" : "white"} italic>
          {waiting ? "Waiting for answer..." : guess}
        </Text>
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
          <SegmentedControl
            ml="auto"
            mr="auto"
            radius="md"
            disabled={waiting}
            onChange={(v) => (guesses[user].correct = Boolean(parseInt(v)))}
            data={[
              {
                label: (
                  <Center>
                    <IconX size={25} />
                    <Box ml={10}>Wrong</Box>
                  </Center>
                ),
                value: "0",
              },
              {
                label: (
                  <Center>
                    <IconCheck size={25} />
                    <Box ml={10}>Right</Box>
                  </Center>
                ),
                value: "1",
              },
            ]}
          />
        </div>
      </Card>
    );
  });
}

function GuessCardV2({ guesses }) {
  return Object.keys(guesses).map((user, index) => {
    const guess = guesses[user].guess;
    const waiting = guess.length == 0;
    return (
      <Card
        key={index}
        shadow="xl"
        radius="md"
        mt="lg"
        mb="lg"
        withBorder
        style={{
          maxWidth: "350px",
          marginLeft: "auto",
          marginRight: "auto",
          padding: "5px",
        }}
      >
        <Text size="xs" align="left" color="dimmed" pb="xs">
          {user}
        </Text>
        <Text color={waiting ? "dimmed" : "yellow"} italic>
          {waiting ? "Waiting for answer..." : guess}
        </Text>
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
          
        </div>
      </Card>
    );
  });
}


function DasherView(sessionId, word, guesses, roundNumber, definition) {
  const ready = Object.keys(guesses).every(
    (user) => guesses[user].guess.length > 0
  );
  return (
    <>
      <Card ml="auto" mr="auto" mb="xl" style={{ maxWidth: "350px" }}>
        <Title color="red.8" size="h4" transform="uppercase">
          {word}
        </Title>
        <Text size="lg" italic>
          {definition}
        </Text>
      </Card>
      <Title size="h3">Answers from Voters</Title>
      <GuessCardV2 guesses={guesses} />
      <Button
        mt="md"
        color="red.8"
        disabled={!ready}
        onClick={() => submissionHandler(sessionId, roundNumber, guesses)}
      >
        Submit
      </Button>
      {!ready && (
        <Text size="xs" pt="md" italic>
          Please wait for users to submit their votes
        </Text>
      )}
    </>
  );
}

export default function GuessingState({
  sessionId,
  dasher,
  word,
  votes,
  roundNumber,
  timer
}) {
  const [definition, setDefinition] = useState("");
  useEffect(() => {
    getWordDefinition(word)
      .then(setDefinition)
      .catch((error) =>
        console.log(`Error retrieving definition for word ${word}: ${error}`)
      );
  }, [word]);
  return cookieCutter.get("username") === dasher
    ? DasherView(
        sessionId,
        word,
        votes,
        roundNumber,
        definition.charAt(0).toUpperCase() + definition.slice(1)
      )
    : VoterView(sessionId, word, votes, roundNumber, timer);
}
