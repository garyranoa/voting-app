import {Modal} from "@mantine/core";
import { BiEditAlt, BiReset   } from "react-icons/bi";

export default function ActionMessageModal(props) {
  const icon = (props.title === "RESET" ? <BiReset size={50} /> : <BiEditAlt size={50} /> )
    return (
        <Modal
          opened={props.opened}
          onClose={() => props.setOpened(false)}
          centered
          overlayProps={{
            backgroundOpacity: 0.55,
            blur: 6,
          }}>
            
            <h2 align="center">{icon}<br/>{props.title}</h2>
        </Modal>
    );

}