import React, { useState, useEffect } from 'react'
import { Stack, Box } from '@chakra-ui/react'
import { FaRegHeart, FaRegComment, FaHeart } from 'react-icons/fa'
import { FiSend } from 'react-icons/fi'
import { BsSave, BsSaveFill } from 'react-icons/bs'
import { fetchLikePostToggle, changeColor, fetchSavePost, fetchUnsavePost, fetchGetMyFriends } from '../../utils'
import SharePostModal from './SharePostModal'


const PostActions = ({ post, fake, setFake, isDetail, setSelectedPost }) => {
    const [seeSharePost, setSeeSharePost] = useState(false)
    const [myFriends, setMyFriends] = useState(null)

    useEffect(() => {
        fetchGetMyFriends((response, status) => {
            if (status === 200) {
                setMyFriends(response)
            }
        }) 
    }, [])

  return  (
    <Stack direction='row' m='2' spacing={300}>

        <Stack direction='row' spacing={5}>
        <Box style={{cursor: 'pointer'}}>
            {post.liked ? <FaHeart size={30} color='red' onClick={e => {
                e.preventDefault()
                fetchLikePostToggle(post.id, 'unlike', (response, status) => {
                if (status === 200) {
                    post.liked = false
                    post.likes = response.likes
                    setFake(fake+1)
                }
            })
        }} /> : <FaRegHeart size={30} onMouseOver={e => changeColor(e, 'grey')} 
        onMouseOut={e => changeColor(e, 'black')} onClick={e => {
            e.preventDefault()
            fetchLikePostToggle(post.id, 'like', (response, status) => {
                if (status === 200) {
                    post.liked = true
                    post.likes = response.likes
                    setFake(fake+1)
                }
            })
        }} />}
        </Box>

        <Box style={{cursor: 'pointer'}}>
            <FaRegComment size={30} onMouseOver={e => changeColor(e, 'grey')} 
            onMouseOut={e => changeColor(e, 'black')}
            onClick={() => {
                if (!isDetail) {
                    setSelectedPost(post)
                }
            }}
            />
        </Box>

        <Box style={{cursor: 'pointer'}}>
            <FiSend size={30} onMouseOver={e => changeColor(e, 'grey')} 
            onMouseOut={e => changeColor(e, 'black')} onClick={() => setSeeSharePost(true)} />
        </Box>
    </Stack>

    <Box style={{cursor: 'pointer'}}>
        {post.saved ?
        <BsSaveFill size={27} onClick={() => {
            fetchUnsavePost(post.id, (response, status) => {
                if (status === 200) {
                    post.saved = false
                    setFake(fake+1)
                } 
            })
        }} />
            :
        <BsSave size={27} onMouseOver={e => changeColor(e, 'grey')} 
            onMouseOut={e => changeColor(e, 'black')} onClick={() => {
                fetchSavePost(post.id, (response, status) => {
                    if (status === 200) {
                        post.saved = true
                        setFake(fake+1)
                    }
                })
            }} />
        }
    </Box>

    <SharePostModal isOpen={seeSharePost} onClose={() => setSeeSharePost(false)} myFriends={myFriends} post={post} />
</Stack>
)
}

export default PostActions