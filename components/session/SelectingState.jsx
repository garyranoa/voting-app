/**
 * What users see when the state is in the "dasher" state
 */

import { Title, Text, Card, Group, Button } from "@mantine/core";
import cookieCutter from "cookie-cutter";
import { useEffect, useState } from "react";
import { updateRoundState, updateWord} from "../../lib/firebase";
import { ROUND_STATES } from "../../lib/constants";
import OptionsInput from "../inputs/OptionsInput";
import { useForm } from "@mantine/form";
import ErrorMessage, { displayError } from "../errors/ErrorMessage";
import { nextRoundValidators } from "../../lib/validators";
import { IoMdInformationCircleOutline } from "react-icons/io";

const paddingSides = "20px";
const cardStyle = {
  maxWidth: "350px",
  marginLeft: "auto",
  marginRight: "auto",
};

function DasherCaption() {
  return (
    <Text className="votingText"><p>Pick a word for Voting option</p></Text>
  );
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
      The dasher is picking a voting option.
    </Text>
  );
}

function handleSubmission(request, setErrorVisible, setErrorMessage) {
  request
    .then((result) => {
      const { error } = result;
      if (!error) {
          
      } else {
        displayError(error, setErrorVisible, setErrorMessage);
      }
    })
    .catch((error) => displayError(error, setErrorVisible, setErrorMessage));
}


function DasherControls({ sessionId, roundNumber, options }) {
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /*let optionValues = []
  options && options.map((item, i) => (
    optionValues.push({value: item.name, label: item.name})
  ));*/
  
  const form = useForm({
    initialValues: {  },
    validate: {...nextRoundValidators },
  });

  return (
      (roundNumber == 1 ?
            <>
              <Group position="center" spacing="md" grow align="center" className="entryBtns mt-4">
                <Button className="customBtn1" onClick={() => updateWord(sessionId, roundNumber)}>New Option</Button>
                <Button className="customBtn2" onClick={() => updateRoundState(sessionId, roundNumber, ROUND_STATES.GUESSING, options)}>Confirm Option</Button>
              </Group>
            </> 
        :
          <>
            <form className="customModal"
            onSubmit={form.onSubmit((v) =>
              handleSubmission(
                  updateRoundState(sessionId, roundNumber, ROUND_STATES.GUESSING, v.options),
                  setErrorVisible,
                  setErrorMessage
                )
              )}>
              <OptionsInput maxSelectedValues={10} form={form} />
              <Group position="center" spacing="md" grow align="center" className="entryBtns mt-4">
                <Button className="customBtn1" onClick={() => updateWord(sessionId, roundNumber)}>New Option</Button>
                <Button className="customBtn2" type="submit">Confirm Option</Button>
            </Group>
            </form>
            {errorVisible && <ErrorMessage message={errorMessage} />}
          </>
        ));
}

function GuesserWaitScreen() {
  return (
    <Text className="votingInfo" italic><p>Waiting for the dasher to either confirm or reject the voting option...</p></Text>
  );
}

export default function SelectingState({
  sessionId,
  dasher,
  question,
  roundNumber,
  votingOptions
}) {
  const isDasher = cookieCutter.get("username") === dasher;
  const [definition, setDefinition] = useState("");
  /*useEffect(() => {
    getWordDefinition(options)
      .then(setDefinition)
      .catch((error) =>
        console.log(`Error retrieving definition for word ${word}: ${error}`)
      );
  }, [options]);*/
  return (
    <>
      <Title className="voteOption">Voting Option Selection</Title>
      {isDasher ? <DasherCaption /> : <GuesserCaption />}
      <br />
      <Card className="votersCard">
        <Title size="h3"></Title>
        <Title className="votersFeature mb-4">Feature #{question.id}</Title>
        <Title className="votersRef mb-4">{question.title}</Title>
        {/* <Text className="votersDescription" dangerouslySetInnerHTML={{ __html: question.description }}></Text> */}
        
        <Text className="votersDescription mb-4">
          <a href="#" className="viewDescription"><IoMdInformationCircleOutline /> View Description</a>
        </Text>
        {isDasher ? (
          <DasherControls sessionId={sessionId} roundNumber={roundNumber} options={votingOptions} />
        ) : (
          <GuesserWaitScreen />
        )}
      </Card>      
    </>
  );
}
