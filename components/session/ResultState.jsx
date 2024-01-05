import {
  Table,
  Title,
  Text,
  Button,
  Modal,
  Center,
  Box,
  ScrollArea,
} from "@mantine/core"
import { sortBy } from "lodash"
import cookieCutter from "cookie-cutter"
import Link from "next/link"
import { deleteUserVote, newRound, updateUserVote, newGameSession } from "../../lib/firebase"
import { useState } from "react"
import ImportModal from "../modals/ImportModal"
import { BiUpvote } from "react-icons/bi"
import VoterMenu from "../admin/voterMenu"
import Router from "next/router";
import ErrorMessage, { displayError } from "../errors/ErrorMessage";
import { GAME_STATES } from "../../lib/constants"


function handleNewGame(request, setErrorVisible, setErrorMessage) {
  request
    .then((result) => {
      const { sessionId, error } = result;
      if (!error) {
        Router.push("/[sessionId]", `/${sessionId}`);
      } else {
        //displayError(error, setErrorVisible, setErrorMessage);
        console.log(error);
      }
    })
    .catch((error) => console.log(error) /*displayError(error, setErrorVisible, setErrorMessage)*/);
}

function EndOfGame(sessionId, session) {
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createOpened, setCreateOpened] = useState(false)
  let baseSessionId = sessionId;
  const rounds = session.rounds;
  const dasher = session.creator;
  console.log('result state', sessionId)
  //voters auto redirect to new game sssion
  if (cookieCutter.get("username") != dasher 
      && session.state == GAME_STATES.NEXTROUND 
      && session.nextSessionId) {
        const nextSessionId = session.nextSessionId;
        console.log('nextSessionId', nextSessionId)
        Router.push("/[nextSessionId]", `/${nextSessionId}`);
  }
  
  return (
    <>
      <Title mb="md" size="h4">
        ENDING STATS
      </Title>
      <Table
        mr="auto"
        ml="auto"
        style={{ maxWidth: "350px" }}
        verticalSpacing="xs"
        horizontalSpacing="xs"
        captionSide="bottom"
        highlightOnHover
      >
        <caption></caption>
        <thead>
          <tr>
            <th style={{ textAlign: "center" }}>ROUND</th>
            <th style={{ textAlign: "center" }}>OPTION</th>
            <th style={{ textAlign: "center" }}>VOTING %</th>
          </tr>
        </thead>
        <tbody>
          {rounds &&
            rounds.map(
              (item, i) =>
                item.votingOptions &&
                item.votingOptions.map((votingItem, x) => {
                  return (
                    <tr key={`id-${item.number}${x}`}>
                      <td style={{ textAlign: "center" }}>{item.number}</td>
                      <td style={{ textAlign: "center" }}>{votingItem.name}</td>
                      <td style={{ textAlign: "center" }}>
                        {votingItem.votes} / {`${votingItem.rating.toFixed()}%`}
                      </td>
                    </tr>
                  )
                })
            )}
        </tbody>
      </Table>
      
      
      <Title mt="xl" mb="xl">End of Round </Title>
      
      {session.roundNumber == 1 && cookieCutter.get("username") == dasher && (
        <>
          <Button
            className="customBtn mt-4 mb-4"
            onClick={() => handleNewGame(newGameSession(baseSessionId))}>
            Next Round with KEEP Questions
          </Button>
          <Button
            className="customBtn mt-4 mb-4"
            onClick={() => setCreateOpened(true)}>Import New Questions</Button>
          <ImportModal
            title="Import Question"
            join={false}
            opened={createOpened}
            setOpened={setCreateOpened}
          />
        </>
      )}
      
      {session.roundNumber > 1 && (
        <>
          <Text mt="xl">We hope you have enjoyed this game!</Text>
            <Link href="/" passHref>
              <Button mt="xl" mb="xl" variant="filled" color="red.8" radius="md">
                Home
            </Button>
          </Link>`
        </>
      )}

    </>
  )
}

function GameContinues(sessionId, dasher) {
  const [createOpened, setCreateOpened] = useState(false)

  return (
    <>
      {cookieCutter.get("username") != dasher && (
        <Text className="votingText">
          <p>Please wait for the admin to begin the next question</p>
        </Text>
      )}
      {cookieCutter.get("username") == dasher && (
        <>
          <Button
            className="customBtn mt-4 mb-4"
            onClick={() => newRound(sessionId)}
          >
            Next Question
          </Button>
          <Text className="votersText text-center">
            <p>
              As the admin, you can end this round. Please check with your
              friends that everyone is ready!
            </p>
          </Text>

          
        </>
      )}
    </>
  )
}

function ResultStats({ results }) {
  return (
    <>
      <Title className="votingTitle1 mt-4 pt-4">QUESTION STATS</Title>
      <Table
        className="customTable"
        cellPadding="0"
        cellSpacing="0"
        width="100%"
      >
        <caption></caption>
        <thead>
          <tr>
            <th style={{ textAlign: "center" }}>OPTION</th>
            <th style={{ textAlign: "center" }}>VOTING %</th>
          </tr>
        </thead>
        <tbody>
          {results.map((entry, i) => {
            return (
              <tr key={`stats${i}`}>
                <td style={{ textAlign: "center" }}>{entry.name}</td>
                <td style={{ textAlign: "center" }}>{entry.rating}%</td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </>
  )
}

function ResultboardItem({ session, roundNumber, voter, vote }) {
  const sessionId = session.id
  const [showVoteOption, setShowVoteOption] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const options =
    session && session.defaultOptions ? session.defaultOptions : []
  
  const modifyHandler = () => {
    setShowVoteOption(true)
  }
  const deleteHandler = () => {
    setShowConfirmDelete(true)
  }

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
    <tr>
      <td style={{ textAlign: "center" }}>{voter}</td>
      <td style={{ textAlign: "center" }}>
        <strong>{vote}</strong>
      </td>
      <td style={{ textAlign: "center" }}>
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

function Resultboard({ session, roundNumber, results }) {
  return (
    <>
      <Title className="votingTitle1">RESULTS</Title>
      <Table
        className="customTable mb-4"
        cellPadding="0"
        cellSpacing="0"
        width="100%"
      >
        <caption></caption>
        <thead>
          <tr>
            <th style={{ textAlign: "center" }}>VOTER</th>
            <th style={{ textAlign: "center" }}>SELECTION</th>
            <th style={{ textAlign: "center" }}>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {results.map((entry, i) => {
            return (
              <ResultboardItem
                key={`results${i}`}
                session={session}
                roundNumber={roundNumber}
                voter={entry.user}
                vote={entry.votes}
              />
            )
          })}
        </tbody>
      </Table>
    </>
  )
}

export default function ResultState({
  sessionId,
  voters,
  dasher,
  isLastRound,
  round,
  rounds,
  roundNumber,
  session,
}) {
  const results = sortBy(
    Object.keys(voters)
      .filter((user) => user != dasher)
      .map((user) => {
        return {
          user: user,
          votes: user in round.votes ? round.votes[user].vote : "",
          order: user,
        }
      }),
    "order"
  )

  const stats = round.votingOptions

  return (
    <>
      {dasher === cookieCutter.get("username") && (
        <Resultboard
          session={session}
          roundNumber={roundNumber}
          results={results}
        />
      )}

      {!isLastRound && dasher === cookieCutter.get("username") && (
        <ResultStats results={stats} />
      )}

      {isLastRound ? EndOfGame(sessionId, session) : GameContinues(sessionId, dasher)}
    </>
  )
}
