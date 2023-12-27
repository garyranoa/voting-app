import {Modal} from "@mantine/core";
import { BiStopwatch, BiPauseCircle   } from "react-icons/bi";

export default function DisableModal(props) {
  const icon = (props.title === "PAUSED" ? <BiPauseCircle size={50} /> : <BiStopwatch size={50} /> )
    return (
        <Modal
          className={props.className}
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
            
            <h2 align="center">{icon}<br/>{props.title}</h2>
        </Modal>
    );

}