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
        <div>
          <h2 style={{ fontWeight: "bold" }}>Backlogapalooza</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h1>Menu</h1>
          <SelectionButton
            content="NEW GAME"
            onClick={() => setCreateOpened(true)}
          />
          <SelectionButton
            content="START VOTING"
            onClick={() => setJoinOpened(true)}
          />
        </div>
        <br />
        <br />
        <Paper
          style={{
            padding: "10px 10px",
            maxWidth: "500px",
            margin: "auto auto",
          }}
          shadow="xxl"
          radius="lg"
          p="s"
          withBorder
        >
          <Text size="md">
            Please click the START VOTING button to start voting!
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
