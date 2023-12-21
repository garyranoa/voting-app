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

const scenarioHandler = (id, round, voters, isLastRound, timer, rounds, votingOptions) => {
  switch (round.state) {
    case ROUND_STATES.SELECTING:
      return (
        <SelectingState
          sessionId={id}
          dasher={round.dasher}
          question={round.question}
          roundNumber={round.number}
          votingOptions={votingOptions}
        />
      );
    case ROUND_STATES.GUESSING:
      return (
        <GuessingState
          sessionId={id}
          dasher={round.dasher}
          question={round.question}
          votes={round.votes}
          roundNumber={round.number}
          timer={timer}
          voting_state={round.voting_state}
          votingOptions={votingOptions}
        />
      );
    case ROUND_STATES.VOTING:
      return (
        <VotingState
          sessionId={id}
          roundNumber={round.number}
          voters={round.voters}
          options={round.options}
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
          rounds={rounds}
        />
      );
    default:
      return Loading();
  }
};

export default function Round({ sessionData }) {
  const { limit, rounds, voters, id, timer, defaultOptions } = sessionData;
  if (rounds === undefined) return Loading();
  const latestRound = rounds.at(-1);
  const isLastRound = latestRound.number == limit;
  let options = latestRound.number == 1 ? defaultOptions : latestRound.votingOptions
  if (latestRound.state === ROUND_STATES.SELECTING) { options = defaultOptions }
  return (
    <>
      <div>
        {latestRound.dasher === cookieCutter.get("username") ? (
          <Title className="votingTitle">You are the dasher</Title>
        ) : (
          <Title className="votingTitle">You are a voter</Title>
        )}
      </div>
      {latestRound.state != null && (
        <Text className="voteCounter">Round {latestRound.number} of {limit}</Text>
      )}
      <div className="divider"></div>
      {scenarioHandler(id, latestRound, voters, isLastRound, timer, rounds, options)}      
    </>
  );
}
