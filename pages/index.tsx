import React, { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Button,
  Box,
  FormControl,
  FormLabel,
  Stack,
  Heading,
  Input,
  FormHelperText,
  Flex,
  Center,
  HStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useMutation } from "react-query";

import UserContext from "context/User";
import { useUserMedia } from "hooks/useUserMedia";

import Header from "components/Header";
import SpaceMan from "components/SpaceMan";
import MicrophoneButton from "components/controls/buttons/MicrophoneButton";
import CameraButton from "components/controls/buttons/CameraButton";
import ErrorModal from "components/modals/ErrorModal";

const Home = () => {
  const router = useRouter();
  const didPopulateDevicesRef = useRef(false);
  const user = React.useContext(UserContext);
  const [participantName, setParticipantName] = useState("");
  const [joining, setJoining] = useState(false);
  const [hasBlurredNameInput, setHasBlurredNameInput] = useState(false);
  const { requestPermissionAndPopulateDevices } = useUserMedia();
  const [errorModalTitle, setErrorModalTitle] = useState("");
  const [errorModalMessage, setErrorModalMessage] = useState("");
  const {
    isOpen: isErrorModalOpen,
    onOpen: onErrorModalOpen,
    onClose: onErrorModalClose,
  } = useDisclosure();

  const createSpaceMutation = useMutation(["Spaces"], () =>
    fetch(`/api/spaces`, {
      method: "POST",
      mode: "no-cors",
    }).then((res) => {
      if (res.ok) {
        return res.json();
      } else if (res.status === 401) {
        throw new Error("Not authorized to create space");
      } else if (res.status === 419) {
        throw new Error("Maximum active space limit reached");
      } else {
        throw new Error("Error creating space");
      }
    })
  );

  useEffect(() => {
    if (didPopulateDevicesRef.current === false) {
      didPopulateDevicesRef.current = true;
      requestPermissionAndPopulateDevices();
    }
  }, [requestPermissionAndPopulateDevices]);

  useEffect(() => {
    setParticipantName(user.participantName);
  }, [user.participantName]);

  const invalidParticipantName = useMemo(
    () => !participantName,
    [participantName]
  );

  const disableJoin = useMemo(
    () => invalidParticipantName,
    [invalidParticipantName]
  );

  const isNameInputInvalid = useMemo(
    () => invalidParticipantName && hasBlurredNameInput,
    [invalidParticipantName, hasBlurredNameInput]
  );

  const handleParticipantNameChange = (event: {
    target: { value: string };
  }) => {
    setParticipantName(event.target.value);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setJoining(true);
    user.setParticipantName!(participantName);
    user.setInteractionRequired(false);

    createSpaceMutation.mutate(undefined, {
      onError: (error) => {
        const message = (error as Error).message;

        if (message.includes("Not authorized")) {
          setErrorModalTitle("Not authorized to create a new space");
          setErrorModalMessage(
            "Make sure MUX_TOKEN_ID and MUX_TOKEN_SECRET are set. Refer to the README in https://github.com/muxinc/meet for more details."
          );
          onErrorModalOpen();
        } else if (message.includes("space limit reached")) {
          setErrorModalTitle("Maximum active space limit reached");
          setErrorModalMessage(
            "This demo app has reached the maximum number of active spaces, please try again later when things settle down."
          );
          onErrorModalOpen();
        }

        setJoining(false);
      },
      onSuccess: (newSpace) => {
        if (newSpace) {
          router.push({
            pathname: `/space/${newSpace.id}`,
          });
        }
      },
    });
  }

  return (
    <>
      <Head>
        <title>ARVRtise Haus</title>
        <meta name="description" content="Real-time meetings" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <Flex direction="column" height="100vh" backgroundColor="#323232">
        <Header />
        <Center height="100%" zIndex={1}>
          <Flex direction="column" align="center">
            <Box background="white" padding="4" borderRadius="4" width="360px">
              <form onSubmit={handleSubmit}>
                <Stack spacing="4">
                  <Heading>Join a Room 💜🔑🚪</Heading>

                  <FormControl
                    isInvalid={isNameInputInvalid}
                    onBlur={() => setHasBlurredNameInput(true)}
                  >
                    <FormLabel>Your Name</FormLabel>
                    <Input
                      maxLength={40}
                      id="participant_name"
                      value={participantName}
                      onChange={handleParticipantNameChange}
                    />
                    <FormHelperText
                      color={!isNameInputInvalid ? "white" : "#E22C3E"}
                    >
                      This cannot be empty.
                    </FormHelperText>
                  </FormControl>

                  <Button
                    type="submit"
                    width="full"
                    isDisabled={disableJoin}
                    isLoading={joining}
                  >
                    Join a New Room
                  </Button>
                </Stack>
              </form>
            </Box>
            <HStack>
              <MicrophoneButton />
              <CameraButton />
            </HStack>
          </Flex>
        </Center>
        <SpaceMan />
      </Flex>

      <ErrorModal
        title={errorModalTitle}
        message={errorModalMessage}
        isOpen={isErrorModalOpen}
        onClose={onErrorModalClose}
      />
    </>
  );
};

export default Home;
