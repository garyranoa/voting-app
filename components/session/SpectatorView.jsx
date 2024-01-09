import {
  Button,
  Card,
  Center,
  Text,
  Title,
  Box,
  Modal,
  ScrollArea,
  Table,
} from "@mantine/core"

import { IconCheck, IconX } from "@tabler/icons"
import {
  BiDislike,
  BiLike,
  BiEditAlt,
  BiReset,
  BiUpvote,
  BiDotsVerticalRounded,
} from "react-icons/bi"
import { useEffect, useState } from "react"
import { updateUserVote, deleteUserVote } from "../../lib/firebase"
import { IoMdInformationCircleOutline } from "react-icons/io"
import { sortBy } from "lodash"
import VoterMenu from "../admin/voterMenu"
import useRoundTimer from "../../hooks/useRoundTimer"
import useRoundStats from "../../hooks/useRoundStats"
import { ROUND_STATES } from "../../lib/constants"

function ResultboardItem({ session, roundNumber, voter, vote }) {
  const sessionId = session.id
  const [showVoteOption, setShowVoteOption] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const currentRound =
    roundNumber in session.rounds ? session.rounds[roundNumber] : null
  const options = currentRound.votingOptions.map((m) => m.name)
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
        <center>Voter: {voter}</center>
        <div
          style={{
            paddingTop: "10px",
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: "100%",
            display: "block",
            flexDirection: "row",
            alignItems: "center",
            textAlign: "center",
            justifyContent: "space-between",
          }}
        >
          {options &&
            options.map((item, i) => (
              <Button
                key={i}
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
                className="modifyVoteBtn"
              >
                <Center>
                  {/* <BiUpvote size={25} /> */}
                  <Box>{item}</Box>
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
        <center>Voter: {voter}</center>
        <div
          style={{
            paddingTop: "10px",
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: "100%",
            display: "block",
            flexDirection: "row",
            alignItems: "center",
            textAlign: "center",
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
            className="modifyVoteBtn"
          >
            <Center>
              {/* <BiUpvote size={25} /> */}
              <Box>DELETE</Box>
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
            className="modifyVoteBtn"
          >
            <Center>
              {/* <BiUpvote size={25} /> */}
              <Box>CANCEL</Box>
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
      <Title className="votingTitle1">PARTIAL RESULTS</Title>
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

          {/* <tr key={`results${i}`}>
                <td style={{ textAlign: "center" }}>{entry.user}</td>
                <td style={{ textAlign: "center" }}>
                  <strong>{entry.votes}</strong>
                </td>
                <td>
                  {modifyModal}
                  {confirmDeleteModal}
                  <VoterMenu
                    modifyHandler={modifyHandler}
                    deleteHandler={deleteHandler}
                  />
                </td>
              </tr> */}
        </tbody>
      </Table>
    </>
  )
}
function ResultStats({ round }) {
  const { votingOptionsStats } = useRoundStats({
    votes: round?.votes,
    votingOptions: round?.votingOptions,
  })

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
          {votingOptionsStats.map((entry, i) => {
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

export default function SpectatorView(
  sessionId,
  question,
  votes,
  roundNumber,
  definition,
  isLastRound,
  dasher,
  voters,
  round,
  session,
  timer
) {
  const [timeLeft, _, theTimerComponent] = useRoundTimer({
    endAt: round?.endAt,
  })

  const { votingOptionsStats } = useRoundStats({
    votes: round?.votes,
    votingOptions: round?.votingOptions,
  })

  const highestVote = votingOptionsStats
    .sort((a, b) => b.rating - a.rating)
    .at(0)

  const ready = round.state !== ROUND_STATES.RESULTS

  const results = sortBy(
    Object.keys(voters)
      .filter((user) => user != dasher)
      .map((user) => {
        return {
          user,
          votes: user in round.votes ? round.votes[user].vote : "",
          order: user,
        }
      }),
    "order"
  )

  const [createOpenedDescription, setCreateOpenedDescription] = useState(false)
  const title = (
    <Text>
      <IoMdInformationCircleOutline /> DESCRIPTION
    </Text>
  )
  return (
    <>
      <Card className="votersCard mb-4">
        <Title className="votersFeature mb-4">Feature #{question.id}</Title>
        <Title className="votersRef mb-4">{question.title}</Title>
        {question.description && (
          <Text className="viewDescription text-center">
            <Button onClick={() => setCreateOpenedDescription(true)}>
              <IoMdInformationCircleOutline /> View Description
            </Button>
          </Text>
        )}
      </Card>

      {theTimerComponent}

      <Modal
        className="votingDescription"
        title={title}
        scrollAreaComponent={ScrollArea.Autosize}
        opened={createOpenedDescription}
        onClose={() => setCreateOpenedDescription(false)}
        closeOnClickOutside={true}
        closeOnEscape={true}
        withCloseButton={true}
        closeOnConfirm={true}
        closeOnCancel={true}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 6,
        }}
      >
        <Text dangerouslySetInnerHTML={{ __html: question.description }}></Text>
      </Modal>
      <ResultStats round={round} />
      {ready ? (
        <Text className="votingText">
          <p>Voting is underway!</p>
        </Text>
      ) : (
        <Text className="votingText">
          <p>Please wait for next question!</p>
        </Text>
      )}
    </>
  )
}
