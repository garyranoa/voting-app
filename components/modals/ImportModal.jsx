/**
 * Session creation screen
 */

import { Button, Modal } from "@mantine/core";
import { useForm } from "@mantine/form";
import { initSession, joinSession, getVotingOption } from "../../lib/firebase";
import Dropzone from "../inputs/Dropzone";
import ErrorMessage, { displayError } from "../errors/ErrorMessage";
import { useState } from "react";
import Router from "next/router";
import cookieCutter from "cookie-cutter";

/**
 * Session creation modal
 * If the request succeeds, we redirect the player to the session page and set a cookie with their username
 * If the request fails, then we display a temporary error message and wait for further input
 * @param request a promise that resolves to a session ID
 * @param username username provided by the user
 * @param setErrorVisible setter for the error state
 */
function handleSubmission(request, username, setErrorVisible, setErrorMessage) {
  request
    .then((result) => {
      const { sessionId, error } = result;
      if (!error) {
        cookieCutter.set("username", username);
        Router.push("/[sessionId]", `/${sessionId}`);
      } else {
        displayError(error, setErrorVisible, setErrorMessage);
      }
    })
    .catch((error) => displayError(error, setErrorVisible, setErrorMessage));
}

export default function SessionModal(props) {
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <Modal
      className="customModal"
      opened={props.opened}
      onClose={() => props.setOpened(false)}
      title={props.title}
    >
      <Dropzone className='p-16 mt-10 border border-neutral-200' />

    </Modal>
  );
}
