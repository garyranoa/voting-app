import { MultiSelect } from "@mantine/core";

export default function VotingOptionsInput(props) {
    
    const data = [
        { value: 'KEEP', label: 'KEEP' },
        { value: 'KILL', label: 'KILL' },
        { value: 'Q1', label: 'Q1' },
        { value: 'Q2', label: 'Q2' },
        { value: 'Q3', label: 'Q3' },
        { value: 'Q4', label: 'Q4' },
        { value: '2ND HALF', label: '2ND HALF' },
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
                /*{...props.form.getInputProps('options')}*/
            />
        </>
    )
}