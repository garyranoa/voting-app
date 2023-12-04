import {NumberInput} from "@mantine/core";

export default function SelectTimerInput(props) {
    return (
        <>
            <NumberInput
                mt="xl"
                id="session-timer"
                label="Enter the desired number of seconds to vote"
                placeholder="60"
                {...props.form.getInputProps('timer')}
            />
        </>
    )
}