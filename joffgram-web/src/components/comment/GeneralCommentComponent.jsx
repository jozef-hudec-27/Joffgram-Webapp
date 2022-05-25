import React from 'react'
import { Box, HStack, Avatar, VStack, Text, Popover, PopoverTrigger, Button, PopoverContent, PopoverArrow, PopoverCloseButton,
  PopoverBody  } from '@chakra-ui/react'
import { timeSince, changeColor, errorToast } from '../../utils'
import { CustomToggle } from '../CustomToggle'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import DropdownComponent from '../DropdownComponent'


const GeneralCommentComponent = ({ obj, setSelectedComment, userId, funcAfterDelete, toast, fake, setFake,
  fetchLikeObjToggle, fetchDeleteObj, isReply }) => {
  return (
    <Box className='obj' ml='3'>
      <HStack spacing={6}>
          <HStack spacing={3}>
          <Avatar size='sm' src={obj.user?.profile_image} name={obj.user?.username} border='1px solid grey'
              cursor='pointer' onClick={() => window.location.href = `/accounts/${obj.user?.id}`}/>
          <VStack>
              <HStack>
              <Text fontWeight='bold' cursor='pointer' onClick={() => window.location.href = `/accounts/${obj.user?.id}`}>{obj.user?.username}</Text>
              <Text>{obj.body.substring(0, 45)}{obj.body.length > 45 && '... '}
              {obj.body.length > 45 && <Popover>
              <PopoverTrigger>
                  <Button variant='link' colorScheme='blue'>[See all]</Button>
              </PopoverTrigger>
              <PopoverContent>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverBody fontSize='xs'>{obj.body}</PopoverBody>
              </PopoverContent>
              </Popover>}
              </Text>
              </HStack>

              <HStack spacing={4} fontSize='xs'>
              <Text>{timeSince(new Date(obj.created_at), true)}</Text>
              <Text>{obj.likes.length} {obj.likes.length === 1 ? 'like' : 'likes'}</Text>
              {!isReply && <Button variant='link' size='sm' onClick={() => setSelectedComment(obj)}>{obj.replies?.length} {obj.replies?.length === 1 ? 'reply' : 'replies'}</Button>}
              {obj.user?.id == userId && (
                  <Box ml='' style={{cursor: 'pointer'}}>
                  <DropdownComponent toggle={CustomToggle} toggleColor='grey' children
                    dropdownItemsActions={[[
                        'Delete',
                        () => {
                            fetchDeleteObj(obj.id, (response, status) => {
                                if (status === 200) {
                                    funcAfterDelete(response)
                                } else {
                                    errorToast(toast)
                                }
                            })
                        }
                    ]]} />
                  </Box>
              )}
              </HStack>
          </VStack>
          </HStack>

          <Box className='heartBox' cursor='pointer'>
              {obj.liked ? 
              <FaHeart color='red' onClick={() => {
                  fetchLikeObjToggle(obj.id, 'unlike', (response, status) => {
                  if (status === 200) {
                      obj.liked = false
                      obj.likes = response
                      setFake(fake+1)
                  } else {
                      errorToast(toast)
                  }
                  })
              }} />
              :
              <FaRegHeart 
                  onMouseOver={e => changeColor(e, 'grey')} 
                  onMouseOut={e => changeColor(e, 'black')}
                  onClick={() => {
                  fetchLikeObjToggle(obj.id, 'like', (response, status) => {
                      if (status === 200) {
                      obj.liked = true
                      obj.likes = response
                      setFake(fake+1)
                      } else {
                      errorToast(toast)
                      }
                  })
                  }}
              />
              }
          </Box>
      </HStack>
      <br />
    </Box>
)
}

export default GeneralCommentComponent