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
          <h2 style={{ fontWeight: "bold" }}>Fibbage like Game</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h1>Menu</h1>
          <SelectionButton
            content="New Game"
            onClick={() => setCreateOpened(true)}
          />
          <SelectionButton
            content="Join Game"
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
          Fibbage is the lying, bluffing, fib-till-you-win multiplayer trivia party game from the makers of YOU DON'T KNOW JACK! Play with 2-8 players! Fool your friends with your lies, avoid theirs, and find the (usually outrageous) truth. And get this: your phone or tablet is your controller!
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
