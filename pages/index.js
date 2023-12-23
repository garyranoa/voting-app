import Head from "next/head";
import { Text, Paper } from "@mantine/core";
import SessionModal from "../components/modals/SessionModal";
import SelectionButton from "../components/buttons/SelectionButton";
import { useState } from "react";

export default function Home() {
  const [createOpened, setCreateOpened] = useState(false);
  const [joinOpened, setJoinOpened] = useState(false);
  
  return (
    <div>
      <main>
        <div className="votingWrap">
          <h1 className="mt-3 mb-3">Voting App</h1>
          <SelectionButton
            className="customBtn"
            content="NEW GAME"
            onClick={() => setCreateOpened(true)}
          />
          <SelectionButton
            className="customBtn"
            content="START VOTING"
            onClick={() => setJoinOpened(true)}
          />
        </div>

        <Paper className="votingText mt-4">
          <Text size="md">
            Please click the <strong>START VOTING</strong> button to start voting!
          </Text>
        </Paper>
        <SessionModal
          title="Create New Round"
          join={false}
          opened={createOpened}
          setOpened={setCreateOpened}
        />
        <SessionModal
          title="Join Round"
          join={true}
          opened={joinOpened}
          setOpened={setJoinOpened}
        />
      </main>
    </div>
  );
}
