import React from 'react'
import { Box } from '@chakra-ui/react'
import Dropdown from 'react-bootstrap/Dropdown'
import { CustomToggle } from '../CustomToggle'
import { fetchDeletePost, makeToast, errorToast } from '../../utils'


const PostDeleteDropdown = ({ post, posts, setPosts, toast }) => {
  return <Box ml='275' style={{cursor: 'pointer'}}>
      <Dropdown>
            <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
            </Dropdown.Toggle>

            <Dropdown.Menu>
                <Dropdown.Item onClick={e => {
                e.preventDefault()
                fetchDeletePost(post.id, (response, status) => {
                    if (status === 200) {
                    const newPosts = [ ...posts ].filter(post_ => post_.id !== post.id)
                    setPosts(newPosts)
                    makeToast(toast, 'deletePost', '', `Deleted post.`, 'info', 5000, 'bottom-right')
                    } else  {
                    errorToast(toast)
                    }
                })
                }}>Delete</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    </Box>
}

export default PostDeleteDropdown