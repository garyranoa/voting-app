import { MultiSelect } from "@mantine/core";

export default function VotingOptionsInput(props) {
    
    const data = [
        { value: 'KEEP', label: 'KEEP' },
        { value: 'KILL', label: 'KILL' },
        { value: 'Q1', label: 'Q1' },
        { value: 'Q2', label: 'Q2' },
        { value: 'H2', label: 'H2' },
      ];

    return (
        <>
            <MultiSelect
                data={data}
                label="Voting Options on this round"
                placeholder="Pick voting options"
                className="customSelect"
                clearable                
                maxSelectedValues={props.maxSelectedValues}
                defaultValue={props.defaultValue}
                {...props.form.getInputProps('options')}
            />
        </>
    )
}