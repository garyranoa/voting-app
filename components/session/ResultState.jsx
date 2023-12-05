import { Table, Title, Text, Button } from "@mantine/core";
import { sortBy } from "lodash";
import cookieCutter from "cookie-cutter";
import Link from "next/link";
import { newRound } from "../../lib/firebase";

function EndOfGame(winners, topScore) {
  return (
    <>
      <Title mt="xl" mb="xl">
        The End
      </Title>
      {winners.length == 1 && (
        <Title size="h3">
          {winners[0]} is the winner with {topScore} points!
        </Title>
      )}
      {winners.length > 1 && (
        <Title size="h3">
          We have multiple winners who are tied with {topScore} point each!
        </Title>
      )}
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
        <Text pt="xl" ml="auto" mr="auto" style={{ maxWidth: "350px" }}>
          Please wait for the dasher to begin begin the next round
        </Text>
      )}
      {cookieCutter.get("username") == dasher && (
        <>
          <Button
            mt="xl"
            mb="xl"
            variant="filled"
            color="red.8"
            radius="md"
            onClick={() => newRound(sessionId)}
          >
            Next Round
          </Button>
          <Text
            style={{ maxWidth: "350px" }}
            mr="auto"
            ml="auto"
            size="sm"
            italic
          >
            As the dasher, you can end this round. Please check with your
            friends that everyone is ready!
          </Text>
        </>
      )}
    </>
  );
}

function Resultboard({ results }) {
  return (
    <>
      <Title mb="md">Results</Title>
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
            <th style={{ textAlign: "center" }}>VOTER</th>
            <th style={{ textAlign: "center" }}>SELECTION</th>
          </tr>
        </thead>
        <tbody>
          {results.map((entry) => {
            return (
              <tr key={entry.user}>
                <td>{entry.user}</td>
                <td>{entry.votes}</td>
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
  round
}) {
  const results = sortBy(
    Object.keys(voters)
    .filter((user) => user != dasher)
    .map((user) => {
      return {
        user: user,
        votes: round.votes[user].vote,
        order: -voters[user].votes,
      };
    }),
    "order"
  );
  const topScore = results[0].votes;
  const winners = results
    .filter((entry) => entry.score == topScore)
    .map((entry) => entry.user);
  return (
    <>
      <Resultboard results={results} />
      {isLastRound
        ? EndOfGame(winners, topScore)
        : GameContinues(sessionId, dasher)}
    </>
  );
}
