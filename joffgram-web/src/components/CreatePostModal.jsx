import React, { useEffect, useState } from 'react'
import ModalComponent from './ModalComponent'
import { MdOutlineAddPhotoAlternate } from 'react-icons/md'
import { Box, Text, Textarea, Button, useToast } from '@chakra-ui/react'
import { fetchCreatePost, makeToast, isFileSizeValid } from '../utils'
import Cropper from 'cropperjs';


const CreatePostModal = ({ postFile, setPostFile, isOpen, setSeeExitCreatePost, setSeeCreatePostModal, posts, setPosts, newPostDesc, setNewPostDesc }) => {
  const [fake, setFake] = useState(1)
  const toast = useToast()

  const [imageFile, setImageFile] = useState(null)
  const [cropInfo, setCropInfo] = useState({})

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

        setPostFile(fileList[0])
      } else {
        makeToast(toast, 'imageTooBig', '', 'The file must be an image or a video.', 'info', 5000)
      }

    }
  }, [fake])

    const body = <Box align='center'>
      <hr />
      <Box m='5'>

        {(!postFile || postFile.type === 'video/mp4') && <MdOutlineAddPhotoAlternate size={150}/>}
        {['video/mp4', 'video/webm'].includes(postFile?.type) && <Text>{postFile.name}</Text>}
        {(postFile && postFile.type !== 'video/mp4') && <>
          <img src='' width='400' id='pickedImagePreview' />
          <br />
        </> }

        <form>
            <input type="file" id='chooseImage' name='postImage' className={postFile !== null && 'd-none'} />
        </form>
        {!postFile && <Text as='sup'>Select post image or video from your device</Text>}
      </Box>

      {postFile !== null && <>
        <Textarea placeholder='Add a description. (max. 2200 characters)' value={newPostDesc} onChange={e => {
          if (e.target.value.length <= 2200) {
            setNewPostDesc(e.target.value)
          }
        }} />

        <Button variant='link' colorScheme='blue' onClick={() => {
          const base64ImageString = isFileSizeValid(imageFile)[0]

          if (base64ImageString != null || postFile.type.startsWith('video')) {
            var data = new FormData()

            data.append('image', base64ImageString)
            data.append('description', newPostDesc)
            data.append('cropX', cropInfo.cropX)
            data.append('cropY', cropInfo.cropY)
            data.append('cropWidth', cropInfo.cropWidth)
            data.append('cropHeight', cropInfo.cropHeight)
            data.append(postFile.type.startsWith('video') ? 'videoFile' : 'imageFile', postFile)

            fetchCreatePost(data, (response, status) => {
              if (status === 201) {
                setPostFile(null)
                setNewPostDesc('')
                setSeeCreatePostModal(false)

                setPosts([ response ].concat([ ...posts ]))
                makeToast(toast, 'createdPost', '', 'Successfully created post.', 'info', 5000, 'bottom-right')
              } else {
                makeToast(toast, 'errorCreatePost', 'Error creating post!', 'Could not create post. Make sure all data is valid or try again later.',
                'error', 10000, 'bottom-right')
              }
            })
          } else {
            makeToast(toast, 'imageTooBig', '', 'Post image must be smaller than 10MB.', 'info', 5000)
          }
            
        }}>Post</Button>
      </>}
    </Box>
        
    return <ModalComponent isOpen={isOpen} onClose={() => {
      if (postFile !== null) {
        setSeeExitCreatePost(true)
      } else {
        setSeeCreatePostModal(false)
      }
    }} size='xl' body={body} header='Create new post' fake={fake} setFake={setFake} />
  
}

export default CreatePostModal