import { Table, Title, Text, Button } from "@mantine/core";
import { sortBy } from "lodash";
import cookieCutter from "cookie-cutter";
import Link from "next/link";
import { newRound } from "../../lib/firebase";

function EndOfGame(option1, option2) {

  const totalVotes = (option1.length > 0 ? option1[0].votes : 0) + (option2.length > 0 ? option2[0].votes : 0)
  const percent1 = (option2[0].votes / totalVotes) * 100
  const percent2 = (option1[0].votes / totalVotes) * 100

  return (
    <>

<Title mb="md" size="h4">ENDING STATS</Title>
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
            <th style={{ textAlign: "center" }}>OPTION</th>
            <th style={{ textAlign: "center" }}>VOTING %</th>
          </tr>
        </thead>
        <tbody>
            {option2.length > 0 && (
              <tr>
              <td>{option2[0].name}</td>
              <td>{option2[0].votes} / {`${percent1.toFixed()}%`}</td>
            </tr>
          )}

          {option1.length > 0 && (
              <tr>
              <td>{option1[0].name}</td>
              <td>{option1[0].votes} / {`${percent2.toFixed()}%`}</td>
            </tr>
          )}
        </tbody>
      </Table>

      <Title mt="xl" mb="xl">
        The End
      </Title>
      <Text mt="xl">We hope you have enjoyed this game!</Text>
      <Link href="/" passHref>
        <Button mt="xl" mb="xl" variant="filled" color="red.8" radius="md">
          Home
        </Button>
      </Link>
    </>
  );
}

function GameContinues(sessionId, dasher) {
  return (
    <>
      {cookieCutter.get("username") != dasher && (
        <Text className="votingText"><p>Please wait for the dasher to begin begin the next round</p></Text>
      )}
      {cookieCutter.get("username") == dasher && (
        <>
          <Button className="customBtn mt-4 mb-4" onClick={() => newRound(sessionId)}>Next Round</Button>
          <Text className="votersText text-center">
            <p>As the dasher, you can end this round. Please check with your friends that everyone is ready!</p>
          </Text>
        </>
      )}
    </>
  );
}

function ResultStats({ results }) {
  return (
    <>
      <Title className="votingTitle1 mt-4 pt-4">ROUND STATS</Title>
      <Table className="customTable" cellPadding="0" cellSpacing="0" width="100%">
        <caption></caption>
        <thead>
          <tr>
            <th style={{ textAlign: "center" }}>OPTION</th>
            <th style={{ textAlign: "center" }}>VOTING %</th>
          </tr>
        </thead>
        <tbody>
          {results.map((entry) => {
            return (
              <tr key={entry.option}>
                <td style={{ textAlign: "center" }}>{entry.option}</td>
                <td style={{ textAlign: "center" }}>{entry.percent}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}

function Resultboard({ results }) {
  return (
    <>
      <Title className="votingTitle1">RESULTS</Title>
      <Table className="customTable mb-4" cellPadding="0" cellSpacing="0" width="100%">
        <caption></caption>
        <thead>
          <tr>
            <th style={{ textAlign: "center" }}>VOTER</th>
            <th style={{ textAlign: "center" }}>SELECTION</th>
          </tr>
        </thead>
        <tbody>
          {results.map((entry) => {
            return (
              <tr key={entry.user}>
                <td style={{ textAlign: "center" }}>{entry.user}</td>
                <td style={{ textAlign: "center" }}><strong>{entry.votes}</strong></td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}

export default function ResultState({
  sessionId,
  voters,
  dasher,
  isLastRound,
  round,
  rounds

}) {
  const results = sortBy(
    Object.keys(voters)
    .filter((user) => user != dasher)
    .map((user) => {
      return {
        user: user,
        votes: round.votes[user].vote,
        order: user
      };
    }),
    "order"
  );
  const topScore = results[0].votes;
  const winners = results
    .filter((entry) => entry.score == topScore)
    .map((entry) => entry.user);

  let option1TotalVotes = 0
  let option2TotalVotes = 0
  let option1TRoundVotes = 0
  let option2TRoundVotes = 0
  
  const latestRound = rounds.at(-1);
  for (const round in rounds) {
    const roundInfo = rounds[round];
    for (const r in roundInfo) {
      if (r === 'votes') {
        for (const vote in roundInfo[r]) {
          let selected = roundInfo[r][vote].vote
          if (selected === 'KILL') {
            option1TotalVotes++
          } else {
            option2TotalVotes++
          }

        
          if (latestRound.number === roundInfo.number) {
            if (selected === 'KILL') {
              option1TRoundVotes++
            } else {
              option2TRoundVotes++
            }
          }
        }
      }
    }
}
const totalVoters = option1TRoundVotes + option2TRoundVotes
const option1 = [{name: "KILL" , votes: option1TotalVotes}]
const option2 = [{name: "KEEP", votes: option2TotalVotes}]
const percent1 = (option1TRoundVotes / totalVoters) * 100
const percent2 = (option2TRoundVotes / totalVoters) * 100

const stats = [{option: "KEEP", percent: `${percent2.toFixed()}%`}]
stats.push({option: "KILL", percent: `${percent1.toFixed()}%`})
  
  return (
    <>
      {dasher === cookieCutter.get("username") && (
      <Resultboard results={results} />)}

      {dasher === cookieCutter.get("username") && (
      <ResultStats results={stats} />)}

      {isLastRound
        ? EndOfGame(option1, option2)
        : GameContinues(sessionId, dasher)}
    </>
  );
}
