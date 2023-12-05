import {Modal, SimpleGrid, Title} from "@mantine/core";

const questionsAndAnswers = [
    [
        "I cannot return to the home screen! What do I do?",
        "Clicking on the logo, on the top of the page will take you to the home screen",
    ],
]

export default function HelpModal(props) {
    return (
        <Modal
            opened={props.opened}
            onClose={() => props.setOpened(false)}
            title="Help"
            fullScreen
        >
            <SimpleGrid>
                {questionsAndAnswers.map((value, index) => {
                    let question = value[0]
                    let answer = value[1]
                    return (
                        <div key={index}>
                            <Title size="h3">{question}</Title>
                            <p>{answer}</p>
                            <br/>
                        </div>
                    )
                })}
            </SimpleGrid>
        </Modal>
        )
    }