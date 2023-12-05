/**
 * Modal that pops up when the user clicks on the "About" button
 */

import {Modal} from "@mantine/core";

export default function AboutModal(props) {
    return (
        <Modal
            opened={props.opened}
            onClose={() => props.setOpened(false)}
            title="About"
            fullScreen
        >
            <p>
                About Text
            </p>
        </Modal>
    )
}