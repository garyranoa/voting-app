/**
 * What users see when the state is in the "dasher" state
 */

import {
  Title,
  Text,
  Card,
  Group,
  Button,
  Modal,
  ScrollArea,
} from "@mantine/core"
import cookieCutter from "cookie-cutter"
import { useEffect, useState } from "react"
import { updateRoundState, updateWord } from "../../lib/firebase"
import { ROUND_STATES } from "../../lib/constants"
import OptionsInput from "../inputs/OptionsInput"
import { useForm } from "@mantine/form"
import ErrorMessage, { displayError } from "../errors/ErrorMessage"
import { nextRoundValidators } from "../../lib/validators"
import { IoMdInformationCircleOutline } from "react-icons/io"

const paddingSides = "20px"
const cardStyle = {
  maxWidth: "350px",
  marginLeft: "auto",
  marginRight: "auto",
}

function DasherCaption() {
  return (
    <Text className="votingText">
      <p>Pick a question for this round</p>
    </Text>
  )
}

function GuesserCaption() {
  return (
    <Text
      mr="auto"
      ml="auto"
      style={{
        paddingLeft: paddingSides,
        paddingRight: paddingSides,
        maxWidth: "350px",
      }}
    >
      The admin is picking a voting question.
    </Text>
  )
}

function handleSubmission(request, setErrorVisible, setErrorMessage) {
  request
    .then((result) => {
      const { error } = result
      if (!error) {
      } else {
        displayError(error, setErrorVisible, setErrorMessage)
      }
    })
    .catch((error) => displayError(error, setErrorVisible, setErrorMessage))
}

function DasherControls({ session, roundNumber, options }) {
  const [errorVisible, setErrorVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [questionIndex, setQuestionIndex] = useState(0)
  
  function indexCounter() {
    setQuestionIndex(currentIndex => {
      const index = currentIndex + 1;
      return index;
    })
  }

  /*let optionValues = []
  options && options.map((item, i) => (
    optionValues.push({value: item.name, label: item.name})
  ));*/

  const form = useForm({
    initialValues: {},
    validate: { ...nextRoundValidators },
  })

  const showOptions = false;
  return !showOptions ? (
    <>
      <Group
        position="center"
        spacing="md"
        grow
        align="center"
        className="entryBtns mt-4"
      >
        <Button
          className="customBtn1"
          onClick={() => updateWord(session.id, session._qIndex, roundNumber)}
        >
          New Question
        </Button>
        <Button
          className="customBtn2"
          onClick={() =>
            updateRoundState(
              session.id,
              roundNumber,
              ROUND_STATES.GUESSING,
              options
            )
          }
        >
          Start Voting
        </Button>
      </Group>
    </>
  ) : (
    <>
      <form
        className="customModal"
        onSubmit={form.onSubmit((v) =>
          handleSubmission(
            updateRoundState(
              sessionId,
              roundNumber,
              ROUND_STATES.GUESSING,
              v.options
            ),
            setErrorVisible,
            setErrorMessage
          )
        )}
      >
        <OptionsInput maxSelectedValues={10} form={form} />
        <Group
          position="center"
          spacing="md"
          grow
          align="center"
          className="entryBtns mt-4"
        >
          <Button
            className="customBtn1"
            onClick={() => updateWord(sessionId, roundNumber)}
          >
            New Question
          </Button>
          <Button className="customBtn2" type="submit">
            Start Voting
          </Button>
        </Group>
      </form>
      {errorVisible && <ErrorMessage message={errorMessage} />}
    </>
  )
}

function GuesserWaitScreen() {
  return (
    <Text className="votingInfo" italic>
      <p>
        Waiting for the admin to either confirm or reject the voting option...
      </p>
    </Text>
  )
}

export default function SelectingState({
  sessionId,
  dasher,
  question,
  roundNumber,
  votingOptions,
  session,
}) {
  const isDasher = cookieCutter.get("username") === dasher
  const [createOpenedDescription, setCreateOpenedDescription] = useState(false)
  const title = (
    <Text>
      <IoMdInformationCircleOutline /> DESCRIPTION
    </Text>
  )
  /*useEffect(() => {
    getWordDefinition(options)
      .then(setDefinition)
      .catch((error) =>
        console.log(`Error retrieving definition for word ${word}: ${error}`)
      );
  }, [options]);*/
  return (
    <>
      <Title className="voteOption">Voting Question Selection</Title>
      {isDasher ? <DasherCaption /> : <GuesserCaption />}
      <br />
      <Card className="votersCard">
        <Title size="h3"></Title>
        <Title className="votersFeature mb-4">Feature #{question.id}</Title>
        <Title className="votersRef mb-4">{question.title}</Title>
        {/* <Text className="votersDescription" dangerouslySetInnerHTML={{ __html: question.description }}></Text> */}

        {question.description && (
          <Text className="viewDescription text-center">
            <Button onClick={() => setCreateOpenedDescription(true)}>
              <IoMdInformationCircleOutline /> View Description
            </Button>
          </Text>
        )}

        <Modal
          className="votingDescription"
          title={title}
          scrollAreaComponent={ScrollArea.Autosize}
          opened={createOpenedDescription}
          onClose={() => setCreateOpenedDescription(false)}
          closeOnClickOutside={true}
          closeOnEscape={true}
          withCloseButton={true}
          closeOnConfirm={true}
          closeOnCancel={true}
          overlayProps={{
            backgroundOpacity: 0.55,
            blur: 6,
          }}
        >
          <Text
            dangerouslySetInnerHTML={{ __html: question.description }}
          ></Text>
        </Modal>

        {isDasher ? (
          <DasherControls
            session={session}
            roundNumber={roundNumber}
            options={votingOptions}
          />
        ) : (
          <GuesserWaitScreen />
        )}
      </Card>
    </>
  )
}
