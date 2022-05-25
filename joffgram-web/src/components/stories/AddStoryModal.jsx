import React, { useEffect, useState } from 'react'
import ModalComponent from '../ModalComponent'
import { MdAddAPhoto } from 'react-icons/md'
import { Box, Text, Button, useToast } from '@chakra-ui/react'
import { fetchAddStory, makeToast, isFileSizeValid } from '../../utils'
import Cropper from 'cropperjs';
import StoryTakePhotoOrVideoModal from './StoryTakePhotoOrVideoModal'


const AddStoryModal = ({ storyFile, setStoryFile, isOpen, setSeeExitAddStory, setSeeAddStoryModal, stories, setStories }) => {
  const [fake, setFake] = useState(1)
  const toast = useToast()

  const [imageFile, setImageFile] = useState(null)
  const [cropInfo, setCropInfo] = useState({})

  const [isTakingPhoto, setIsTakingPhoto] = useState(false)

  const setImageCropProperties = (image, x, y, width, height) => {
		setImageFile(image)
    setCropInfo({
      cropX: x, cropY: y, cropWidth: width, cropHeight: height
    })
	}
                                
  useEffect(() => {
    document.getElementById("chooseImage")?.addEventListener("change", handlePickFile, false);
    function handlePickFile() {
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
      const fileList = this.files;

      if (fileList[0].size / 1024 / 1024 < 10) {
        if ((fileList[0].type === 'video/mp4') === false) {
          reader.readAsDataURL(this.files[0])
        }

        setStoryFile(fileList[0])
      } else {
        makeToast(toast, 'imageTooBig', '', 'The file must be smaller than 10 MB.', 'info', 5000)
      }

    }
  }, [fake])

    const body = <Box align='center'>
      <hr />
      <Box m='5'>
        {(!storyFile || ['video/mp4', 'video/webm'].includes(storyFile.type)) && <MdAddAPhoto size={150}/>}
        {['video/mp4', 'video/webm'].includes(storyFile?.type) && <Text>{storyFile.name}</Text>}
        {(storyFile && storyFile.type !== 'video/mp4') && <>
          <img src='' width='400' id='pickedImagePreview' />
          <br />
        </> }
   
        <Button colorScheme='blue' mb='2' className={storyFile !== null && 'd-none'} onClick={() => setIsTakingPhoto(true)}>Use my camera</Button>
        <Button onClick={() => document.getElementById('chooseImage').click()} className={storyFile !== null && 'd-none'}>Upload from storage</Button>

        <form className='d-none'>
            <input type="file" id='chooseImage' name='storyImage' className={storyFile !== null && 'd-none'} />
        </form>
      </Box>

      {storyFile !== null && <>
        <Button variant='link' colorScheme='blue' onClick={() => {
          const base64ImageString = isFileSizeValid(imageFile)[0]

          if (base64ImageString != null || storyFile.type.startsWith('video')) {
            var data = new FormData()

            data.append('image', base64ImageString)
            data.append('cropX', cropInfo.cropX)
            data.append('cropY', cropInfo.cropY)
            data.append('cropWidth', cropInfo.cropWidth)
            data.append('cropHeight', cropInfo.cropHeight)
            data.append(storyFile.type.startsWith('video') ? 'videoFile' : 'imageFile', storyFile)

            fetchAddStory(data, (response, status) => {
              if (status === 201) {
                setStoryFile(null)
                setSeeAddStoryModal(false)

                setStories([ ...stories ].concat([ response ]))
                makeToast(toast, 'addedStory', '', 'Successfully added story.', 'info', 5000, 'bottom-right')
              } else {
                makeToast(toast, 'errorAddStory', 'Error adding story!', 'Could not create story. Make sure all data is valid or try again later.',
                  'error', 10000, 'bottom-right')
              }
            })
          } else {
            makeToast(toast, 'imageTooBig', '', 'Story file must be smaller than 10MB and must be either video or image.', 'info', 5000)
          }
            
        }}>Add</Button>
      </>}
    </Box>
        
    return <>
      <ModalComponent isOpen={isOpen} onClose={() => {
      if (storyFile !== null) {
        setSeeExitAddStory(true)
      } else {
        setSeeAddStoryModal(false)
      }
    }} size='sm' body={body} header='Add new story' fake={fake} setFake={setFake} />

    <StoryTakePhotoOrVideoModal isOpen={isTakingPhoto} setIsOpen={setIsTakingPhoto} setStoryFile={setStoryFile}
      setImageCropProperties={setImageCropProperties} toast={toast} />
    </>
  
}    

export default AddStoryModal