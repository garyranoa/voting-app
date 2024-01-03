import { Menu, Button, Text } from "@mantine/core"
import {
  IconSettings,
  IconSearch,
  IconPhoto,
  IconMessageCircle,
  IconTrash,
  IconArrowsLeftRight,
} from "@tabler/icons"

export default function VoterMenu({ modifyHandler, deleteHandler }) {
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button>
          <IconSettings size={14} />
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Options</Menu.Label>
        <Menu.Item icon={<IconSettings size={14} />} onClick={modifyHandler}>
          Modify
        </Menu.Item>
        <Menu.Divider />
        <Menu.Label>Danger zone</Menu.Label>
        <Menu.Item
          color="red"
          icon={<IconTrash size={14} />}
          onClick={deleteHandler}
        >
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
