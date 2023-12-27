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
  UnstyledButton,
  Menu, MenuItem, MenuLabel, Divider,
} from "@mantine/core";

import { IconCheck, IconX } from "@tabler/icons";
import { BiDislike, BiLike, BiEditAlt, BiReset, BiUpvote, BiDotsVerticalRounded  } from "react-icons/bi";
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
  updateUserTimeExpire,
  updateUserActionVote,
} from "../../lib/firebase";
import { getWordDefinition } from "../../lib/vocab";
import DisableVotingModal from "../modals/DisableVotingModal";
import ActionMessageModal from "../modals/ActionMessageModal";
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { IoMdInformationCircleOutline } from "react-icons/io";

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

function VoterEntryViewOptions({ sessionId, roundNumber, options }) {
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

        {options &&
          options.map((item, i) => (
            <>
              <Button key={i} color={i % 2 ? 'red' : 'blue'} variant="filled" radius="md" mt="xl" mb="xl" uppercase
                  disabled={disabled}
                    onClick={() => updateUserVote(sessionId,roundNumber,cookieCutter.get("username"), {id: i, name: item.name})}>
              <Center><BiUpvote size={25} /><Box ml={10}>{item.name}</Box></Center>
            </Button>&nbsp;
            </>
        ))}
        </div>
    </>
  );
}

function VoterWaitView({ vote }) {
  return (
    <>
      <Title className="voteOption mt-4 mb-3">{vote}</Title>
      <Text className="votingText"><p>You have already submitted your vote, please wait for the others</p></Text>
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

function VoterView(sessionId, question, votes, roundNumber, timer, votingState, votingOptions) {
  const [createOpened, setCreateOpened] = useState(false);
  const [createOpenedPause, setCreateOpenedPause] = useState(false);
  const [createOpenedAction, setCreateOpenedAction] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const user = cookieCutter.get("username")
  const vote = votes[cookieCutter.get("username")].vote;
  const expire = votes[cookieCutter.get("username")]?.expire;
  const action = votes[cookieCutter.get("username")]?.action;

  const paddingSides = "10px";
const cardStyle = {
  maxWidth: "350px",
  marginLeft: "auto",
  marginRight: "auto",
};
console.log(votingState, action)

  let actionMessage = ""
  if (votingState === VOTING_STATES.PAUSED) {  
    if (!createOpenedPause) {
      setCreateOpenedPause(true)
      if (showTimer) { 
        setShowTimer(false) 
      }else {
        setShowTimer(true)
      }
    } else {
      if (showTimer) { 
        setShowTimer(false) 
      } 
    }
    
  }
  else if (expire == 0 && action.length > 0) {
    if (action == "ACTION") {
      updateUserActionVote(sessionId,roundNumber, user, "")
      if (createOpenedAction) { setCreateOpenedAction(false) }
      if (!showTimer) { 
        //setShowTimer(true)
      }
      
    }else {
      if (action == "RESET") {
        actionMessage = "VOTE RESET"
      } else {
        actionMessage = "YOU ARE ASK TO EDIT YOUR VOTE"
      }
      if (!createOpenedAction) { 
        setCreateOpenedAction(true) 
        if (showTimer) { 
          setShowTimer(false) 
        }
        updateUserActionVote(sessionId,roundNumber, user, "ACTION")
      }
    }
    
  }else {
    
    if (expire === 0 && action.length == 0) {
      if (!showTimer) { 
        setShowTimer(true) 
      }else {
        if (createOpened) {
          setCreateOpened(false) 
        }
      }
    }
  }

  
  return (
    <div style={{ paddingLeft: "10px", paddingRight: "10px" }}>
      {(showTimer && vote.length === 0) ? (
        
      <div className="timer-wrapper">
          <CountdownCircleTimer
            isPlaying
            size={150}
            duration={timer}
            colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
            colorsTime={[10, 6, 3, 0]}
            onComplete={() => {
              updateUserTimeExpire(sessionId,roundNumber,cookieCutter.get("username"), 1)
              setCreateOpened(true)
              setShowTimer(false)
              
              return { shouldRepeat: false, delay: 1.5 }
            }}>
          {RenderTime}
        </CountdownCircleTimer>
      </div>) : <></>}
      <Title className="voteOption mb-4 mt-4">Vote the following feature</Title>
      <Card className="votersCard">
        <Title className="votersFeature mb-4">Feature #{question.id}</Title>
        <Title className="votersRef mb-4">{question.title}</Title>
        {/* <Title className="votersDescription" dangerouslySetInnerHTML={{ __html: question.description }}></Title> */}
        <Text className="viewDescription text-center">          
          <Button><IoMdInformationCircleOutline /> View Description</Button>
        </Text>
      </Card>
      {vote.length > 0 ? (
        <VoterWaitView vote={vote} />
      ) : (
        <VoterEntryViewOptions sessionId={sessionId} roundNumber={roundNumber} options={votingOptions} />
      )}

      {votingState === VOTING_STATES.PAUSED ? (
        <DisableVotingModal
            title={votingState}
            opened={createOpenedPause}
            setOpened={setCreateOpenedPause}/>) : (<></>)}

      {votingState === "RUNNING" && action.length == 0 ? (
        <DisableVotingModal
          title="TIME EXPIRES"
          opened={createOpened}
          setOpened={setCreateOpened}/>) : (<></>)}

    {votingState === "RUNNING" && action.length > 0 ? (
        <ActionMessageModal
          title={actionMessage}
          opened={createOpenedAction}
          setOpened={setCreateOpenedAction}/>) : (<></>)}


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
            className="votersSwitch"
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

function actionSubmitHandler(sessionId, roundNumber, user, action) {
  updateUserActionVote(sessionId,roundNumber, user, action)
  updateUserVote(sessionId,roundNumber,user, '');
}

function VotersActionMenu(user, menuNo, sid, round) {
  return (
    <Menu position="right" offset={10}>
      <Menu.Target>
        <Button  size="xs" rightIcon={<BiDotsVerticalRounded size="20" />} variant="subtle" color="dark">
          {user}
        </Button>
      </Menu.Target>
      <Menu.Dropdown color="red">
        {menuNo === 1 && (
          <>
            <Menu.Item size="xs" icon={<BiReset size={15} />}
            onClick={() =>
              actionSubmitHandler(sid,round, user, "RESET")

            }>Reset Vote</Menu.Item>

            <Menu.Item size="xs" icon={<BiEditAlt size={15} />}
            onClick={() =>
              actionSubmitHandler(sid,round, user, "EDIT")
            }>Edit Vote</Menu.Item>

          </>
        )} 
        {menuNo === 2 && (
          <>
            <Menu.Item size="xs" icon={<BiUpvote size={15} />}
            onClick={() =>
              updateUserTimeExpire(sid,round, user, 0)
            }>Revote</Menu.Item>
          </>
        )}
        
        
      </Menu.Dropdown>
      
    </Menu>
  );
}

function GuessCardV2({ votes, sid, round }) {
  return Object.keys(votes).map((user, index) => {
    const vote = votes[user].vote;
    const expire = votes[user].expire;
    const waiting = vote.length == 0;
    let menuNo = (expire == 1 && vote.length == 0 ? 2 : 0)
    if (menuNo == 0 ) { menuNo = (expire == 0 && vote.length > 0 ? 1 : 0) }
    
    return (
      <Card key={index} className="votersCard1">        
        <Text className="votersUsername">
          {menuNo == 0 && (user)}
          {menuNo > 0 && (VotersActionMenu(user, menuNo, sid, round))}
        </Text>
        <Text className="voteOption mt-3" color={waiting ? "dimmed" : "yellow"}>{waiting ? "Waiting for answer..." : vote}</Text>
      </Card>
    );
  });
}


function DasherView(sessionId, question, votes, roundNumber, definition) {
  const ready =  Object.keys(votes).every(
    (user) => votes[user].vote.length > 0
  );
  return (
    <>
    
      <SegmentedControl  
        className="voterSwitch mb-4 mt-4"    
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

      <Card className="votersCard mb-4">
        <Title className="votersFeature mb-4">Feature #{question.id}</Title>
        <Title className="votersRef mb-4">{question.title}</Title>
      </Card>
      <Title className="voteOption mt-2 mb-3">Selected vote from Voters</Title>
      <GuessCardV2 votes={votes} sid={sessionId} round={roundNumber} />
      <Button className="customBtn mt-4" disabled={!ready} onClick={() => submissionHandler(sessionId, roundNumber, votes)}>Submit</Button>
      {!ready && (
        <Text className="votingText"><p>Please wait for users to submit their votes</p></Text>
      )}
    </>
  );
}

export default function GuessingState({
  sessionId,
  dasher,
  question,
  votes,
  roundNumber,
  timer,
  votingState,
  votingOptions
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
        question,
        votes,
        roundNumber,
        ""
      )
    : VoterView(sessionId, question, votes, roundNumber, timer, votingState, votingOptions);
}
