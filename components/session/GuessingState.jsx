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
import { MAX_DEF_LEN, MIN_DEF_LEN, ROUND_STATES, VOTING_STATES, } from "../../lib/constants";
import {
  updateRoundState,
  updateUserGuess,
  updateUserIsCorrect,
  updateUserVote,
  updateRoundVotingState,
  getVotingOption,
} from "../../lib/firebase";
import { getWordDefinition } from "../../lib/vocab";
import DisableVotingModal from "../modals/DisableVotingModal";
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

function VoterEntryViewOptions({ sessionId, roundNumber }) {
  const [definition, setDefinition] = useState("");
  const invalidDefinition = definition.length < MIN_DEF_LEN || definition.length > MAX_DEF_LEN;
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

function VoterWaitView({ vote }) {
  return (
    <>
      <Title size="h4" mt="md" mb="xl" italic>
        {vote}
      </Title>
      <Text pl="lg" pr="lg">
        You have already submitted your vote, please wait for the others
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

function VoterView(sessionId, options, votes, roundNumber, timer, voting_state) {
  const [createOpened, setCreateOpened] = useState(false);
  const [createOpenedPause, setCreateOpenedPause] = useState(false);
  const vote = votes[cookieCutter.get("username")].vote;

  const paddingSides = "10px";
const cardStyle = {
  maxWidth: "350px",
  marginLeft: "auto",
  marginRight: "auto",
};

  if (!createOpenedPause && voting_state === VOTING_STATES.PAUSED) {
    setCreateOpened(false)
    setCreateOpenedPause(true)
  }
  let hideTimer = true
  if (vote.length == 0) {hideTimer = false}
  if (hideTimer && vote.length == 0) {hideTimer = false}
  return (
    <div style={{ paddingLeft: "10px", paddingRight: "10px" }}>
      {vote.length == 0 || voting_state !== VOTING_STATES.PAUSED ? (
        
      <div className="timer-wrapper">
          <CountdownCircleTimer
            isPlaying
            size={150}
            duration={timer}
            colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
            colorsTime={[10, 6, 3, 0]}
            onComplete={() => {
              setCreateOpenedPause(false)
              setCreateOpened(true)
              return { shouldRepeat: false, delay: 1.5 }
            }}>
          {RenderTime}
        </CountdownCircleTimer>
      </div>) : <></>}
      <Title size="h4" style={{
        paddingTop: paddingSides,
        paddingBottom: paddingSides,
      }}>Vote the following feature</Title>
      <Card shadow="lg" radius="md" withBorder style={cardStyle} mb="md">
        <Title size="h5" color="red.5" weight={800}>
          Feature #{options[0].id}
        </Title>
        <Title size="h3" color="blue.5" weight={800}>
          {options[0].title}
        </Title>
        <Title size="sm" italic dangerouslySetInnerHTML={{ __html: options[0].description }}></Title>
      </Card>
      {vote.length > 0 ? (
        <VoterWaitView vote={vote} />
      ) : (
        <VoterEntryViewOptions sessionId={sessionId} roundNumber={roundNumber} />
      )}

      {voting_state === VOTING_STATES.PAUSED ? (

        <DisableVotingModal
            title={voting_state}
            opened={createOpenedPause}
            setOpened={setCreateOpenedPause}/>

      ) : (
      <></>
      )}

{voting_state !== VOTING_STATES.PAUSED ? (

<DisableVotingModal
title="Voting stop. Time expires"
opened={createOpened}
setOpened={setCreateOpened}/>

) : (
<></>
)}


    </div>
  );
}

function submissionHandler(sessionId, roundNumber, votes) {
  /*Object.keys(votes).forEach((user) => {
    if (votes[user].correct) {
      updateUserIsCorrect(sessionId, roundNumber, user).catch((error) =>
        console.log(error)
      );
    }
  });*/
  updateRoundState(sessionId, roundNumber, ROUND_STATES.RESULTS).catch((error) =>
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

function GuessCardV2({ votes }) {
  return Object.keys(votes).map((user, index) => {
    const vote = votes[user].vote;
    const waiting = vote.length == 0;
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
          {waiting ? "Waiting for answer..." : vote}
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


function DasherView(sessionId, options, votes, roundNumber, definition) {
  const ready = Object.keys(votes).every(
    (user) => votes[user].vote.length > 0
  );
  return (
    <>
    
    <SegmentedControl
            ml="auto"
            mr="auto"
            radius="md"
            disabled={false}
            onChange={(v) => (
                    updateRoundVotingState(sessionId, roundNumber, (v == 0 ? VOTING_STATES.PAUSED : VOTING_STATES.RUNNING)).catch((error) =>
                    console.log(error)
                  )
              )}
            data={[
              {
                label: (
                  <Center>
                    <Box ml={10}>ON</Box>
                  </Center>
                ),
                value: "1",
              },
              {
                label: (
                  <Center>
                    <Box ml={10}>OFF</Box>
                  </Center>
                ),
                value: "0",
              },
            ]}
          />

      <Card ml="auto" mr="auto" mb="xl" style={{ maxWidth: "350px" }}>

      <Title size="h5" color="red.5" weight={800}>
          Feature #{options[0].id}
        </Title>
        <Title size="h3" color="blue.5" weight={800}>
          {options[0].title}
        </Title>
      </Card>
      <Title size="h3">Answers from Voters</Title>
      <GuessCardV2 votes={votes} />
      <Button
        mt="md"
        color="red.8"
        disabled={!ready}
        onClick={() => submissionHandler(sessionId, roundNumber, votes)}
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
  options,
  votes,
  roundNumber,
  timer,
  voting_state
}) {
  const [definition, setDefinition] = useState("");
  /*useEffect(() => {
    getWordDefinition(options)
      .then(setDefinition)
      .catch((error) =>
        console.log(`Error retrieving definition for word ${word}: ${error}`)
      );
  }, [options]);*/
  return cookieCutter.get("username") === dasher
    ? DasherView(
        sessionId,
        options,
        votes,
        roundNumber,
        ""
      )
    : VoterView(sessionId, options, votes, roundNumber, timer, voting_state);
}
