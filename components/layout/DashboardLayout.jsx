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
import { useRouter } from "next/router";

export default function Layout({ children }) {

  const router = useRouter();
  const isHome = router.asPath === '/'

  return (
    <div className="content bd-masthead">
      <div className="contentWrapperV2">
        {isHome && (
        <Link href="/" passHref>
          <a className="logo text-center">
            <Image src="/hisa-logo.png" alt="" width={170} height={170} />
          </a>
        </Link>)}
        <div>{children}</div>
      </div>
      {/*<Footer />*/}
    </div>
  );
}
