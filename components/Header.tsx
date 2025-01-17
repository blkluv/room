import React from "react";
import Image from "next/image";
import { AiOutlineHeatMap } from "react-icons/ai";
import { Flex, Spacer } from "@chakra-ui/react";

import muxLogo from "../public/mux-logo.svg";

export default function Header(): JSX.Element {
  return (
    <Flex
      zIndex={2}
      padding="2"
      alignItems="center"
      justifyContent="space-between"
      backgroundColor="#292929"
      borderBottom="1px solid #e8e8e8"
    >
      <Flex alignItems="center" padding="10px" width="290px">
        <a
          href="https://www.mux.com/real-time-video"
          target="_blank"
          rel="noreferrer"
        >
          <Image priority alt="logo" width={150} height={35} src={muxLogo} />
        </a>
      </Flex>
      <Spacer />
      <Flex alignItems="center" padding="10px">
        <a
          href="https://arvrtise.com"
          target="_blank"
          rel="noreferrer"
        >
          <AiOutlineHeatMap color="white" size="40px" />
        </a>
      </Flex>
    </Flex>
  );
}
