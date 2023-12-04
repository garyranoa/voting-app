/**
 * General layout
 */

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "./Footer";
import {
  Text,
  Title,
} from "@mantine/core";

export default function Layout({ children }) {
  return (
    <div
      style={{
        textAlign: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Link href="/" passHref>
        <a style={{ color: "unset !important", textDecoration: 'none' }}>
        <Text
          component="span"
          align="center"
          variant="gradient"
          gradient={{ from: 'yellow', to: 'red', deg: 45 }}
          size="90px"
          weight={700}
          style={{ fontFamily: 'Greycliff CF, cursive, fantasy' }}
        >
          Voting App
        </Text>
        </a>
      </Link>
      <div>{children}</div>
      <Footer />
    </div>
  );
}
