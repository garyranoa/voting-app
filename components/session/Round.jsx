import { ROUND_STATES } from "../../lib/constants";
import { Text, Title } from "@mantine/core";
import SelectingState from "./SelectingState";
import GuessingState from "./GuessingState";
import VotingState from "./VotingState";
import ResultState from "./ResultState";
import cookieCutter from "cookie-cutter";

function Loading() {
  return (
    <Title style={{ marginTop: "200px", marginBottom: "200px" }}>
      Loading...
    </Title>
  );
}

const scenarioHandler = (id, round, voters, isLastRound, timer) => {
  switch (round.state) {
    case ROUND_STATES.SELECTING:
      return (
        <SelectingState
          sessionId={id}
          dasher={round.dasher}
          word={round.word}
          roundNumber={round.number}
        />
      );
    case ROUND_STATES.GUESSING:
      return (
        <GuessingState
          sessionId={id}
          dasher={round.dasher}
          word={round.word}
          votes={round.votes}
          roundNumber={round.number}
          timer={timer}
        />
      );
    case ROUND_STATES.VOTING:
      return (
        <VotingState
          sessionId={id}
          roundNumber={round.number}
          voters={round.voters}
          word={round.word}
          seed={round.seed}
          dasher={round.dasher}
        />
      );
    case ROUND_STATES.RESULTS:
      return (
        <ResultState
          sessionId={id}
          voters={voters}
          dasher={round.dasher}
          isLastRound={isLastRound}
          round={round}
        />
      );
    default:
      return Loading();
  }
};

export default function Round({ sessionData }) {
  const { limit, rounds, voters, id, timer } = sessionData;
  if (rounds === undefined) return Loading();
  const latestRound = rounds.at(-1);
  const isLastRound = latestRound.number == limit;
  return (
    <>
      {latestRound.state != null && (
        <Title size="h1" mt="lg" mb="lg">
          Round {latestRound.number} of {limit}
        </Title>
      )}
      <div
        style={{
          fontStyle: "italic",
          paddingTop: "10px",
          paddingBottom: "10px",
        }}
      >
        {latestRound.dasher === cookieCutter.get("username") ? (
          <Text color="dimmed" mb="xl">
            You are the dasher
          </Text>
        ) : (
          <Text color="dimmed" mb="xl">
            You are a voter
          </Text>
        )}
      </div>
      {scenarioHandler(id, latestRound, voters, isLastRound, timer)}
      <div
        style={{
          paddingTop: "80px",
        }}
      ></div>
    </>
  );
}
