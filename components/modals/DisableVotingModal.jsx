import {Modal} from "@mantine/core";

export default function DisableModal(props) {
    return (
        <Modal
          opened={props.opened}
          onClose={() => props.setOpened(false)}
          closeOnClickOutside={false}
          closeOnEscape={false}
          withCloseButton={false}
          closeOnConfirm={false}
          closeOnCancel={false}
          centered
          overlayProps={{
            backgroundOpacity: 0.55,
            blur: 6,
          }}>
            <h2>{props.title}</h2>
        </Modal>
    );

}