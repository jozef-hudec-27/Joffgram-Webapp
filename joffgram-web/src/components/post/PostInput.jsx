import React from 'react'
import { InputGroup, Input, InputRightElement, Text } from '@chakra-ui/react'
import { fetchCreatePostComment, makeToast, errorToast } from '../../utils'


const PostInput = ({ post, comment, setComment, toast, postDetail, comments, setComments }) => {
  return <InputGroup>
        <Input variant='unstyled' size='lg' placeholder='Add a comment...' m='3' value={comment} onChange={e => {
            setComment(e.target.value)
        }} />
        <InputRightElement mt='1'>
            <Text color='blue.400' style={{cursor: (comment.length > 0 && comment[0] !== ' ') ? 'pointer' : 'not-allowed'}} mr='3'
            opacity={(comment.length > 0 && comment[0] !== ' ') ? '1' : '0.5'} onClick={e => {
            if (comment.length > 0 && comment[0] !== ' ') {
                fetchCreatePostComment(post.id, comment, (response, status) => {
                if (status === 201) {
                    if (postDetail) {
                        setComments([ response ].concat([ ...comments ]))
                    }
                    post.comments_count++
                    makeToast(toast, 'createComment', '', `Added comment to ${post.user.username}'s post`, 'info', 5000, 'bottom-right')
                    setComment('')
                } else {
                    errorToast(toast)
                }
                })
            }
            }}>Post</Text>
        </InputRightElement>
    </InputGroup>
}

export default PostInput