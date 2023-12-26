import { Table, Title, Text, Button } from "@mantine/core";
import { sortBy } from "lodash";
import cookieCutter from "cookie-cutter";
import Link from "next/link";
import { newRound } from "../../lib/firebase";

function EndOfGame(rounds) {
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
          <th style={{ textAlign: "center" }}>ROUND</th>
            <th style={{ textAlign: "center" }}>OPTION</th>
            <th style={{ textAlign: "center" }}>VOTING %</th>
          </tr>
        </thead>
        <tbody>
        {rounds && rounds.map((item, i) => (
            item.votingOptions && item.votingOptions.map((votingItem, x) => {
                return (
                <tr key={`id-${item.number}${x}`}>
                  <td style={{ textAlign: "center" }}>{item.number}</td>
                  <td style={{ textAlign: "center" }}>{votingItem.name}</td>
                  <td style={{ textAlign: "center" }}>{votingItem.votes} / {`${votingItem.rating.toFixed()}%`}</td>
                </tr>
              );
            })
        ))}
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
          {results.map((entry, i) => {
            return (
              <tr key={`stats${i}`}>
                <td style={{ textAlign: "center" }}>{entry.name}</td>
                <td style={{ textAlign: "center" }}>{entry.rating}%</td>
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
          {results.map((entry, i) => {
            return (
              <tr key={`results${i}`}>
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

const stats = round.votingOptions;
  
  return (
    <>
      {dasher === cookieCutter.get("username") && (
      <Resultboard results={results} />)}

      {!isLastRound && dasher === cookieCutter.get("username") && (
      <ResultStats results={stats} />)}

      {isLastRound
        ? EndOfGame(rounds)
        : GameContinues(sessionId, dasher)}
    </>
  );
}
