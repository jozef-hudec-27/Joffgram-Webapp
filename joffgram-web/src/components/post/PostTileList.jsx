import React, { useState } from 'react'
import { changeBoxShadow, dividePosts } from '../../utils'
import { VStack, HStack, Box, Text } from '@chakra-ui/react'
import ModalComponent from '../ModalComponent'
import PostDetailPage from '../../pages/PostDetailPage'
import { FaHeart, FaComment } from 'react-icons/fa'


const PostTileList = ({ posts, showPostInModal, userId }) => {
    const [selectedPost, setSelectedPost] = useState(null)
    const [hoveredPost, setHoveredPost] = useState(null)
    
    return (
        <>
            <VStack spacing='24px'>
                {dividePosts(posts, 3).map(rowOfPosts => (
                    <HStack spacing='24px'>
                        {rowOfPosts.map(post => (
                            <Box w='300px' h='305px' bg='yellow.200' style={{ border: '1px solid grey', cursor: 'pointer', background: showPostInModal ? '#575757' : 'white', position: 'relative' }}
                                onMouseOver={e => {
                                    if (showPostInModal === true) {
                                        setHoveredPost(post)
                                    } else {
                                        changeBoxShadow(e, '5px 5px 10px grey')
                                    }
                                }} 
                                onMouseOut={e => {
                                    if (showPostInModal === true) {
                                        setHoveredPost(null)
                                    } else {
                                        changeBoxShadow(e, '')
                                    }
                                }}
                                onClick={() => {
                                    if (showPostInModal === true) {
                                        setSelectedPost(post)
                                    } else {
                                        window.location.href = '/posts/' + post.id + '?t=true'
                                    }
                                }}
                            >
                                <Box style={{width: '100%', height: '100%', opacity: showPostInModal && hoveredPost === post && '0.2' }} className={showPostInModal && 'postMedia'}>
                                    {post.image ? <img src={post.image} style={{width: '100%', height: '100%' }} /> :
                                        <video style={{ width: '100%', height: '100%' }}>
                                            <source src={post.video} type="video/mp4" />
                                        </video> 
                                    }
                                </Box>

                                {hoveredPost === post && <Box style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                    <HStack>
                                        <HStack>
                                            <FaHeart color='white' size={30} />
                                            <Text color='white'>{post.likes.length}</Text>
                                        </HStack>

                                        <HStack>
                                            <FaComment color='white' size={30} />
                                            <Text color='white'>{post.comments_count}</Text>
                                        </HStack>
                                    </HStack>
                                </Box>}
                            </Box>
                        ))}
                    </HStack>
                ))}
            </VStack>

            <ModalComponent isOpen={selectedPost !== null} onClose={() => setSelectedPost(null)} size='full'
                body={<PostDetailPage dataset={{path: '/posts/' + selectedPost?.id, userId: userId}} />} />
        </>
  )
}

export default PostTileList