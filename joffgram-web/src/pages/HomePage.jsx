import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchGetAccountDetail, fetchGetPersonalizedPosts, fetchGetSuggestedUsers, makeToast } from '../utils'
import { Box, VStack, WrapItem, Text, Button, useToast } from '@chakra-ui/react'
import PostList from '../components/post/PostList'
import UsersList from '../components/UsersList'
import AccBadge from '../components/AccBadge'
import Loading from '../components/Loading'
import PostDetailPage from './PostDetailPage'
import ModalComponent from '../components/ModalComponent'
import AccListModal from '../components/AccListModal'
import CreatePostModal from '../components/CreatePostModal'
import AlertDialogComponent from '../components/AlertDialogComponent'


const HomePage = ({ dataset }) => {
  const { username, userId } = dataset
  const [accDetails, setAccDetails] = useState(null)
  const [nextUrl, setNextUrl] = useState(null)
  const [posts, setPosts] = useState(null)
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const [suggestedUserNextUrl, setSuggestedUsersNexUrl] = useState(null)
  const [seeAllSuggestedUsers, setSeeAllSuggestedUsers] = useState(false)
  const [comment, setComment] = useState('')
  const toast = useToast()
  const [fake, setFake] = useState(0)
  const [selectedPost, setSelectedPost] = useState(null)
  const [seeExitCreatePost, setSeeExitCreatePost] = useState(false)
  const [postFile, setPostFile] = useState(null)
  const [seeCreatePostModal, setSeeCreatePostModal] = useState(false)
  const [newPostDesc, setNewPostDesc] = useState('')

  useEffect(() => {
    fetchGetAccountDetail(userId, (response, status) => {
      if (status === 200) {
        setAccDetails(response)
      } else {
          makeToast(toast, 'errorServer', 'Error!', 'There was an error on our side. Please try again later.', 'error', 10000)
      }
      })

    fetchGetPersonalizedPosts((response, status) => {
      if (status === 200) {
        setPosts(response.results)
        setNextUrl(response.next)
      } else {
          makeToast(toast, 'errorServer', 'Error!', 'There was an error on our side. Please try again later.', 'error', 10000)
      }
    })

    fetchGetSuggestedUsers((response, status) => {
      if (status === 200) {
        setSuggestedUsers(response.results)
        setSuggestedUsersNexUrl(response.next)
      } else {
        makeToast(toast, 'errorServer', 'Error!', 'There was an error on our side. Please try again later.', 'error', 10000)
      }
    })
  }, [])

  return (
    <Box>
      <Box align='center' style={{ float: 'left', width: '58%' }}>
        <br /><br /><br /><br /><br />

        <VStack spacing={16} align='stretch' width='481.5px'>
           {posts === null ?  <Loading /> : posts.length === 0 ? <Text>No posts found...</Text> : <PostList posts={posts} setPosts={setPosts}
           toast={toast} fake={fake} setFake={setFake} comment={comment} setComment={setComment} username={username} selectedPost={selectedPost}
           setSelectedPost={setSelectedPost} />}
        </VStack>

        {nextUrl && <>
            <br />
            <Button onClick={e => {
            axios.get(nextUrl)
              .then(data => {          
                setPosts([ ...posts ].concat(data.data.results))
                setNextUrl(data.data.next)
              })
          }} variant='link' colorScheme='blue'>Load more posts</Button>
          <br />
        </>}
        <br />
      </Box>
      
      <Box align='left' style={{ position: 'fixed', left: '881px', top: '45px', animation: '500ms ease-in-out 0s normal none 1 running fadeInDown' }} className='sidebar'>
        <br />

        <AccBadge acc={accDetails} setSeeCreatePostModal={setSeeCreatePostModal} />

        <br /><br />

        <WrapItem m='1'>
          <Text color='grey'>Suggestions for you</Text>
          <Text ml='20' style={{cursor: 'pointer'}} onClick={() => setSeeAllSuggestedUsers(!seeAllSuggestedUsers)}>See all</Text>
        </WrapItem>

        <br />

        <VStack spacing={5} align='stretch' width='250px'>
          <UsersList users={suggestedUsers.slice(0, 5)} fake={fake} setFake={setFake} />
        </VStack>

        <br /><hr width='50%' /><br />
        <Text as='sup' color='grey' opacity='0.5'>© 2022 JOFFGRAM FROM PÄTA</Text>
      </Box>
             
    <ModalComponent isOpen={selectedPost !== null} onClose={() => setSelectedPost(null)} size='full'
      body={<PostDetailPage dataset={{path: '/posts/' + selectedPost?.id, userId: userId}} />}  />

      <AccListModal users={suggestedUsers} nextUserUrl={suggestedUserNextUrl} isOpen={seeAllSuggestedUsers === true}
        onClose={() => setSeeAllSuggestedUsers(false)} header='Suggested users' />

    <CreatePostModal postFile={postFile} setPostFile={setPostFile} isOpen={seeCreatePostModal} setSeeExitCreatePost={setSeeExitCreatePost}
      setSeeCreatePostModal={setSeeCreatePostModal} posts={posts} setPosts={setPosts} newPostDesc={newPostDesc} setNewPostDesc={setNewPostDesc} />

      <AlertDialogComponent isOpen={seeExitCreatePost} onClose={() => setSeeExitCreatePost(false)} header='Exit creating post' body="Are you sure? You can't undo this action afterwards."
        cancelBtnName='Cancel' mainBtn={
          <Button colorScheme='red' onClick={() => {
            setNewPostDesc('')
            setPostFile(null)
            setSeeExitCreatePost(false)
            setSeeCreatePostModal(false)
          }} ml={3}>
            Exit
          </Button>
        } />

    </Box>
  )
}

export default HomePage