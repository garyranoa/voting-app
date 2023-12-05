/**
 * Modal that displays the rules of the game
 */

import {Modal} from "@mantine/core";

export default function RulesModal(props) {
    return (
        <Modal
            opened={props.opened}
            onClose={() => props.setOpened(false)}
            title="Rules"
            fullScreen
        >
            <ul>
                <li>You need at least 3 people to play this game</li>
                <li>The game is played in rounds where one person is the dasher and the others are guessers</li>
            </ul>

        </Modal>
    )
}