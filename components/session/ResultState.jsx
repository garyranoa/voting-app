import { Table, Title, Text, Button } from "@mantine/core";
import { sortBy } from "lodash";
import cookieCutter from "cookie-cutter";
import Link from "next/link";
import { newRound } from "../../lib/firebase";

function EndOfGame(option1, option2) {
  return (
    <>
    &nbsp;
    {option1.length > 0 && (
        <Title size="sm">
          {option1[0].name} has total {option1[0].votes} vote(s)!
        </Title>
      )}
      &nbsp;
      {option2.length > 0 && (
        <Title size="sm">
          {option2[0].name} has total {option2[0].votes} vote(s)!
        </Title>
      )}

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
        order: -voters[user].votes,
      };
    }),
    "order"
  );
  const topScore = results[0].votes;
  const winners = results
    .filter((entry) => entry.score == topScore)
    .map((entry) => entry.user);

    const option1Votes = sortBy(
      Object.keys(rounds)
      .map((round) => round.votes)
      ,
      "order"
    );
console.log(rounds)
console.log(option1Votes)
  const option1Votes1 = rounds
    
  const option1 = [{name: "KEEP" , votes: 1}]
  const option2 = [{name: "KILL", votes: 2}]
  
  return (
    <>
      <Resultboard results={results} />
      {isLastRound
        ? EndOfGame(option1, option2)
        : GameContinues(sessionId, dasher)}
    </>
  );
}
