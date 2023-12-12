import { Group, Text, rem } from '@mantine/core';
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';
import { Dropzone, DropzoneProps, MIME_TYPES } from '@mantine/dropzone';

export default function DropzoneUpload(props) {

    const handleChangeStatus = ({ meta }, status) => {
      console.log(status, meta)
    }
  
    const handleSubmit = (files, allFiles) => {
      console.log(files.map(f => f.meta))
      allFiles.forEach(f => f.remove())
    }

  return (
    <>
    <Text size="sm" inline>
        Import CSV
    </Text>
    <Dropzone
      ultiple={false}
      onChangeStatus={handleChangeStatus}
      onSubmit={handleSubmit}
      maxFiles={1}
      inputContent="Drop 1 File"
      inputWithFilesContent={files => `${1 - files.length} more`}
      submitButtonDisabled={files => files.length < 1}
      onDrop1={(files) => console.log('accepted files', files)}
      onReject={(files) => console.log('rejected files', files)}
      maxSize={3 * 1024 ** 2}
      {...props}
    >
      <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
        <Dropzone.Accept>
          
        </Dropzone.Accept>
        <Dropzone.Reject>
          
        </Dropzone.Reject>
        <Dropzone.Idle>
          
        </Dropzone.Idle>

        <div>
          <Text size="sm" inline>
            Drag CSV file here or click to select file
          </Text>
        </div>
      </Group>
    </Dropzone>
    </>
  );
}