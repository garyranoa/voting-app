/**
 * Session creation screen
 */

import { Button, Modal } from "@mantine/core";
import { useForm } from "@mantine/form";
import { initSession, joinSession, getVotingOption } from "../../lib/firebase";
import {
  baseSessionValidators,
  joinSessionValidators,
  newSessionValidators,
} from "../../lib/validators";
import UsernameInput from "../inputs/UserInput";
import RoundsInput from "../inputs/RoundsInput";
import TimerInput from "../inputs/TimerInput";
import OptionsInput from "../inputs/OptionsInput";
import SessionIdInput from "../inputs/SessionIdInput";
import ErrorMessage, { displayError } from "../errors/ErrorMessage";
import { useState } from "react";
import Router from "next/router";
import cookieCutter from "cookie-cutter";
import { useClickOutside } from '@mantine/hooks';

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
  const ref = useClickOutside(() => props.setOpened(false));
  
  const scenarioValidators = props.join
    ? joinSessionValidators
    : newSessionValidators;
  const form = useForm({
    initialValues: { username: "", sessionId: "", timer: 60, rounds: 1, options: [] },
    validate: { ...baseSessionValidators, ...scenarioValidators },
  });
  
  return (
    <Modal
      className="customModal"
      opened={props.opened}
      onClose={() => props.setOpened(false)}
      title={props.title}
    >
      <form 
        onSubmit={form.onSubmit((v) =>
          handleSubmission(
            props.join
              ? joinSession(v.sessionId, v.username)
              : initSession(v.username, v.rounds, v.timer, v.options),
            v.username,
            setErrorVisible,
            setErrorMessage
          )
        )}
      >
        <UsernameInput form={form} />
        {props.join && <SessionIdInput form={form} />}
        {!props.join && <RoundsInput form={form} />}
        {!props.join && <TimerInput form={form} />}
        {!props.join && <OptionsInput maxSelectedValues={2} form={form} />}
        <Button type="submit">Go!</Button>
      </form>
      {errorVisible && <ErrorMessage message={errorMessage} />}
    </Modal>
  );
}
