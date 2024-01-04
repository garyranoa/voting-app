/**
 * Session creation screen
 */

import { Button, Modal } from "@mantine/core";
import Dropzone from "../inputs/Dropzone";
import ErrorMessage, { displayError } from "../errors/ErrorMessage";
import { useState } from "react";

export default function ImportModal(props) {
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <Modal
      className="customModal"
      opened={props.opened}
      onClose={() => props.setOpened(false)}
      title={props.title}
    >
      <Dropzone className='p-16 mt-10 border border-neutral-200' setOpened={props.setOpened} />

    </Modal>
  );
}
