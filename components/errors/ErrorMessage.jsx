import { Paper, Text, Title } from "@mantine/core";

/**
 * Helper method used to display an error message
 * @param error
 * @param setErrorVisible
 * @param setErrorMessage
 */
export function displayError(error, setErrorVisible, setErrorMessage) {
  console.log("Session submission failed with error: ", error);
  setErrorVisible(true);
  setErrorMessage(`Error: ${error}`);
  setTimeout(() => {
    setErrorVisible(false);
    setErrorMessage("");
  }, 5000);
}

export default function ErrorMessage(props) {
  return (
    <Paper className="errorBox">
      <Title>Error</Title>
      <Text><p>{props.message}</p></Text>
    </Paper>
  );
}
