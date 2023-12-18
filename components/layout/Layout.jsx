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
      className="content bd-masthead"
    >
      <div className="contentWrapper">
        <Link href="/" passHref>
          <a className="logo text-center">
            <Image src="/hisa-logo.png" alt="" width={205} height={205} />
          </a>
        </Link>
        <div>{children}</div>
      </div>
      {/*<Footer />*/}
    </div>
  );
}
