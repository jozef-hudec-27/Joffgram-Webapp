import { Box, Button, ButtonGroup } from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import ModalComponent from '../ModalComponent'
import Cropper from 'cropperjs';
import { makeToast } from '../../utils';


const StoryTakePhotoOrVideoModal = ({ isOpen, setIsOpen, setStoryFile, setImageCropProperties, toast }) => {
    let photoPreviewRef = useRef(null)
    const [stream, setStream] = useState(null)
    let canvasRef = useRef(null)

    let blobs_recorded = []
    const [isRecording, setIsRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState(null)

    const takePhoto = () => {
        const video = photoPreviewRef.current
        const canvas = canvasRef.current
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        canvas.toBlob(blob => { 
            const imageFile = new File([blob], 'storyPhoto', {
                type: 'image/png'
            })

            const reader = new FileReader
			reader.onload = e => {
                const image = e.target.result		
                const imageField = document.getElementById('pickedImagePreview')
                imageField.src = image
                new Cropper(imageField, {         
                    aspectRatio: 1/1.22803738,
                    crop(e) {
                        setImageCropProperties(image, e.detail.x, e.detail.y, e.detail.width, e.detail.height)
                    }
                })
            }    

            if (imageFile.size / 1024 / 1024 < 10) {
                if ((imageFile.type === 'video/mp4') === false) {
                    reader.readAsDataURL(imageFile)
                }

                setStoryFile(imageFile)
            }

            setIsOpen(false)
        })
    }


    const startRecording = () => {
        setIsRecording(true)

        const media_recorder = new MediaRecorder(stream, { mimeType: 'video/webm' }) 
        setMediaRecorder(media_recorder)
       
        media_recorder.addEventListener('dataavailable', function(e) {
            blobs_recorded.push(e.data)
        });

        media_recorder.addEventListener('stop', function() {
            let videoBlob = new Blob(blobs_recorded, { type: 'video/webm' })

            let videoFile = new File([videoBlob], 'storyVideo.webm', { type: 'video/webm' })

            setStoryFile(videoFile)
            setIsOpen(false)
        });

        media_recorder.start(3000);
    }

    useEffect(() => {
        if (isOpen) {
            navigator.mediaDevices
            .getUserMedia({
                video: true, audio: {
                    echoCancellation: false
                }
            })
            .then((stream) => {
                setStream(stream)
                let preview = photoPreviewRef.current
                preview.srcObject = stream;
                preview.play();
            })
            .catch((err) => {
                makeToast(toast, 'cameraAccessDenied', 'Error!', 'Camera access denied. Please allow camera to proceed.', 'error', 10000)
            }); 
        } else {
            stream?.getTracks().forEach(function(track) {
                track.stop();
              });
        }
    }, [isOpen, photoPreviewRef])    

    const body = <Box align='center'>
        <video ref={photoPreviewRef} id='photoPreview'></video>
        <canvas className='d-none' ref={canvasRef}></canvas>

        {stream && !isRecording && <ButtonGroup isAttached mt='2'>
            <Button colorScheme='blue' onClick={takePhoto}>Take picture</Button>
            <Button colorScheme='red' onClick={startRecording}>Start recording</Button>
        </ButtonGroup>}
        
        {isRecording && <Button onClick={() => {
            mediaRecorder.stop()
            setIsRecording(false)
        }}>
            Stop recording
        </Button>}
    </Box>

  return (
    <ModalComponent isOpen={isOpen} onClose={() => setIsOpen(false)} size='lg' body={body} />
  )
}

export default StoryTakePhotoOrVideoModal