import React from 'react'
import { Box, Text } from '@chakra-ui/react'
import { timeSince } from '../../utils'


const PostFooter = ({ post, setSelectedPost }) => {
  return <Box ml='2'>
        <Text>{post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}</Text>
        {post.comments_count > 0 && <>
            <Text as='sup' style={{cursor: 'pointer'}} onClick={() => {
                setSelectedPost(post)
            }}>See all {post.comments_count} comments</Text>
            <br />
        </>}
        <Text as='sup'>{timeSince(new Date(post.created_at))} AGO</Text>
    </Box>
}

export default PostFooter