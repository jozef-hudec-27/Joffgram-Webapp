import React from 'react'
import PostActions from './PostActions'
import PostDeleteDropdown from './PostDeleteDropdown'
import PostFooter from './PostFooter'
import PostInput from './PostInput'
import { Box, WrapItem, Avatar, Text } from '@chakra-ui/react'


const PostList = ({ posts, setPosts, toast, fake, setFake, comment, setComment, username, setSelectedPost }) => {
    return <>
        {posts?.map(post => (
            <Box h='852px' style={{boxShadow: '4px 4px 4px grey', border: '1px solid grey' }} align='left'>
                
                <WrapItem m='5'>
                    <Avatar name={post.user.username} src={post.user.profile_image} style={{ border: '1px solid grey', cursor: 'pointer' }} onClick={() => window.location.href = '/accounts/' + post.user.id} />
                    <Text ml='2' mt='2' style={{ cursor: 'pointer'}} onClick={() => window.location.href = '/accounts/' + post.user.id}>{post.user.username}</Text>
                    {post.user.username === username && <PostDeleteDropdown post={post} posts={posts} setPosts={setPosts} toast={toast} />}
                </WrapItem>

                {post.image ?
                    <img src={post.image} style={{ width: '100%', height: '591.3px', borderTop: '1px solid grey', borderBottom: '1px solid grey', cursor: 'pointer' }} onClick={() => {
                        setSelectedPost(post)
                    }} />
                    :
                    <video controls style={{ width: '100%', height: '591.3px', borderTop: '1px solid grey', borderBottom: '1px solid grey' }}>
                        <source src={post.video} type="video/mp4" />
                    </video> 
                }
 
                <PostActions post={post} fake={fake} setFake={setFake} setSelectedPost={setSelectedPost} />
                <PostFooter post={post} setSelectedPost={setSelectedPost} />
                
                {post?.comments_count === 0 && <br />}
                <hr />
                
                <PostInput post={post} comment={comment} setComment={setComment} toast={toast} />
            </Box>
        ))}
  </>
}

export default PostList