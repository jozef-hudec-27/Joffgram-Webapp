import React from 'react'
import { Box, VStack, HStack, Progress, Avatar, Text, IconButton, Input } from '@chakra-ui/react'
import { BsFillArrowLeftCircleFill, BsFillArrowRightCircleFill } from 'react-icons/bs'
import { fetchCommentOnStory, timeSince } from '../../utils'


const StoryComponent = ({ stories, details, storyIndex, setStoryIndex, storyComment, setStoryComment }) => {
    let storyFileExtension = stories?.[storyIndex]?.file?.split('.')[4]

    const videoFormats = ['mp4', 'ogg', 'webm', 'storyVideo']
    const imageFormats = ['jpeg', 'gif', 'png', 'apng', 'svg', 'bmp', 'jpg']

  return (
    <Box>
        <br />
        
        <Box>
            <VStack spacing={-16}>
                <VStack spacing={1} align='left'>
                    <Progress min={0} max={stories?.length} value={storyIndex+1} w='500px' style={{zIndex: 999}} size='sm' />
                    <HStack style={{zIndex: 999}} mr='300'>
                        <Avatar src={details?.profile_image} border='2px solid grey' />
                        <Text fontWeight='bold' color='white'>{details?.username}</Text>
                        <Text fontSize='xs' color='white'>{timeSince(new Date(stories?.[storyIndex]?.created_at), true)}</Text>
                    </HStack>
                </VStack>

                <HStack justify='center'>
                    <IconButton icon={<BsFillArrowLeftCircleFill size={30} />} disabled={storyIndex === 0} onClick={() => setStoryIndex(storyIndex-1)} />
                    {imageFormats.includes(storyFileExtension) && (
                        <img src={stories?.[storyIndex]?.file} style={{ height: '657px', width: '535px', borderRadius: '15px', opacity: storyComment.length > 0 && 0.7, zIndex: 0,
                        border: '3px solid grey' }} alt='Story image' />
                    )}

                    {videoFormats.includes(storyFileExtension) && (
                        <video controls src={stories?.[storyIndex]?.file} style={{ height: '657px', width: '535px', borderRadius: '15px', opacity: storyComment.length > 0 && 0.7, zIndex: 0,
                        border: '3px solid grey' }} />
                    )}
                    <IconButton icon={<BsFillArrowRightCircleFill size={30} />} disabled={storyIndex === stories?.length - 1} onClick={() => setStoryIndex(storyIndex+1)} />
                </HStack>
                
                {details?.we_follow_them && <>
                    <form onSubmit={e => {
                        e.preventDefault()
                        if (storyComment != '' && storyComment[0] !== ' ') {
                            fetchCommentOnStory(stories?.[storyIndex]?.id, storyComment, (response, status) => {
                                if (status === 200) {
                                    setStoryComment('')
                                }
                            })
                        }
                    }}>
                        <Input w='500px' borderRadius='50px' style={{zIndex: 999}} color='white' onChange={e => {
                            setStoryComment(e.target.value)
                            }} value={storyComment} placeholder={`Reply to ${details?.username}...`}/>
                    </form>
                </>}
            </VStack>
        </Box>
    </Box>
  )
}

export default StoryComponent