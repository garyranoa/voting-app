import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { BiCloudUpload, BiSolidMessageSquareX, BiSolidFile  } from "react-icons/bi";
import ErrorMessage, { displayError } from "../errors/ErrorMessage";
import { importQuestionFromCSV } from "../../lib/firebaseQuestions"


const Dropzone = ({ className, setOpened }) => {
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadURL, setDownloadURL] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [files, setFiles] = useState([])
  const [rejected, setRejected] = useState([])

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (acceptedFiles?.length) {
        setFiles([])
      setFiles(previousFiles => [
        ...previousFiles,
        ...acceptedFiles.map(file =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        )
      ])
    }

    if (rejectedFiles?.length) {
      setRejected(previousFiles => [...previousFiles, ...rejectedFiles])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv, text/csv, application/vnd.ms-excel, application/csv, text/x-csv, application/x-csv, text/comma-separated-values, text/x-comma-separated-values',]
    },
    maxSize: Infinity,
    maxFiles: 1,
    multiple: false,
    onDrop
  })

  useEffect(() => {
    // Revoke the data uris to avoid memory leaks
    return () => files.forEach(file => URL.revokeObjectURL(file.preview))
  }, [files])

  const removeFile = name => {
    setFiles(files => files.filter(file => file.name !== name))
  }

  const removeAll = () => {
    setFiles([])
    setRejected([])
  }

  const removeRejected = name => {
    setRejected(files => files.filter(({ file }) => file.name !== name))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    
    if (!files?.length) return
    
    const papa = require("papaparse");
    let csvData = {};
    if (files) {
        const reader = new FileReader();

        files.forEach(file => reader.readAsBinaryString(file))
        reader.onabort = () => console.log("file reading was aborted");
        reader.onerror = () => console.log("file reading failed");
        reader.onload = () => {
            // Parse CSV file
            papa.parse(reader.result, { header: true }).data.forEach((row) => {
                if (row.id) {csvData[row.id] = {id : row.id, title: row.title, description: row.description};}
            });
            if (csvData) {
                importQuestionFromCSV(csvData);
            }
            setFiles([])
            alert('Import Successful');
            if (setOpened) { setOpened(false) };
        };
    }

    /*if (files) {
        const file = files[0]
        const name = file.name
        const storageRef = ref(storage, `csv/${name}`)
        const uploadTask = uploadBytesResumable(storageRef, file)
  
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
  
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused')
                break
              case 'running':
                console.log('Upload is running')
                break
            }
          },
          (error) => {
            message.error(error.message)
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((url) => {
              console.log(url)
              setDownloadURL(url)
              setFiles([])
            })
          },
        )
      } else {
        message.error('File not found')
      }*/

  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        {...getRootProps({
          className: className
        })}
      >
        <input {...getInputProps()} />
        <div className='flex flex-col items-center justify-center gap-4'>
          <BiCloudUpload className='w-5 h-5 fill-current' />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag & drop files here, or click to select files</p>
          )}
        </div>
      </div>

      {/* Preview */}
      <section className='mt-10'>
        

        {/* Accepted files */}
        <ul className='mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-10'>
          {files.map(file => (
            <li key={file.name} className='relative h-32 rounded-md shadow-lg'>
              <button
                type='button'
                className='w-7 h-7 border border-secondary-400 bg-secondary-400 rounded-full flex justify-center items-center absolute -top-3 -right-3 hover:bg-white transition-colors'
                onClick={() => removeFile(file.name)}
              >
                <BiSolidMessageSquareX  className='w-5 h-5 fill-white hover:fill-secondary-400 transition-colors' />
              </button>
              <p className='mt-2 text-neutral-500 text-[12px] font-medium'>
                {file.name}
              </p>
            </li>
          ))}
        </ul>

        <div className='flex gap-4'>
          <button
            type='submit' className='ml-auto mt-1 text-[12px] uppercase tracking-wider font-bold text-neutral-500 border border-purple-400 rounded-md px-3 hover:bg-purple-400 hover:text-white transition-colors'>
            Import
          </button>
        </div>
      </section>
      {errorVisible && <ErrorMessage message={errorMessage} />}
    </form>
  )
}

export default Dropzone
