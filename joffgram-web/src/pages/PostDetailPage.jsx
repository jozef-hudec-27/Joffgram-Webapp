import React, { useState, useEffect } from 'react'
import { fetchGetPostDetail, fetchGetPostComments, makeToast, timeSince, errorToast, fetchDeletePost, fetchLikeCommentToggle,
  fetchDeletePostComment, fetchLikeReplyToggle, fetchDeletePostCommentReply } from '../utils'
import { useToast, Box, VStack, HStack, Avatar, Text, Button } from '@chakra-ui/react'
import Loading from '../components/Loading'
import PostActions from '../components/post/PostActions'
import PostInput from '../components/post/PostInput'
import { CustomToggle } from '../components/CustomToggle'
import GeneralCommentList from '../components/comment/GeneralCommentList'
import CommentReplyModal from '../components/comment/CommentReplyModal'
import PopoverComponent from '../components/PopoverComponent'
import DropdownComponent from '../components/DropdownComponent'


const PostDetailPage = ({ dataset }) => {
    const { userId, path } = dataset
    const isNewWindow = path.endsWith('?t=true')
    let postId = path.split('/')[2]
    if (isNewWindow) { postId = postId.split('?')[0] }
    const [details, setDetails] = useState(null)
    const [comments, setComments] = useState(null)
    const [error, setError] = useState(false)
    const [fake, setFake] = useState(0)
    const [comment, setComment] = useState('')
    const [commentReply, setCommentReply] = useState('')
    const [selectedComment, setSelectedComment] = useState(null)
    const toast = useToast()
    

    useEffect(() => {
      fetchGetPostDetail(postId, (response, status) => {
        if (status === 200) {
          setDetails(response)
        } else {
            makeToast(toast, 'errorFetchPostDetail', 'Error!', 'Could not find post. Make sure it exists or try again later.', 'error', 10000)
            setError(true)
        }
      })

      fetchGetPostComments(postId, (response, status) => {
        if (status === 200) {
          setComments(response)
        } else {
          makeToast(toast, 'errorFetchPostComments', 'Error!', 'Could not load post comments. Make sure the post exists or try again later.', 'error', 10000)
          setError(true)
        }
      })
    }, [])

  return (
    <>
      <br /><br /><br /><br />
      {error === false && (details === null || comments === null) && <Loading />}
      {error === false && details !== null && comments !== null && <>
        {isNewWindow && <Button variant='link' colorScheme='blue' m='1' onClick={() => window.location.href = '/accounts/' + userId}>Back</Button>}
        <Box align='center'><br />
          <Box className='postBox' style={{height : '657px', width: '1011px'}}>
            <Box className='postPhoto' style={{ float: 'left', width: '53%', border: '1px solid black', borderRight: '', height: '100%' }}>
              {details.image ? <img style={{ height: '100%', width: '100%' }} src={details.image} alt='post photo' /> :
                <video controls style={{ width: '100%', height: '100%' }}>
                  <source src={details.video} type="video/mp4" />
                </video>
              }
            </Box>

            <Box className='postDetails' style={{ float: 'right', width: '47%', border: '1px solid black', borderLeft: '', height: '100%' }}>
              <br />
              <VStack spacing={8} align='left' ml='3'>
                  <HStack spacing='200px'>
                    <HStack spacing={5}>
                      <Avatar size='sm' src={details.user.profile_image} name={details.user.username} border='1px solid #4299e1'
                        cursor='pointer' onClick={() => window.location.href = `/accounts/${details.user.id}`} />
                      <Text fontWeight='bold' cursor='pointer' onClick={() => window.location.href = `/accounts/${details.user.id}`}>{details.user.username}</Text>
                      <Text>●</Text>
                      {details.user.we_follow_them == true && <Text color='blue.400' style={{fontWeight: 'bold'}}>Following</Text>}
                      {details.user.we_follow_them == false && details.user.id != userId && <Text color='blue.400' style={{fontWeight: 'bold'}}>Not Following</Text>}
                      {details.user.id == userId && <Text color='blue.400' style={{fontWeight: 'bold'}}>Me</Text>}
                    </HStack>

                    {details.user.id == userId && (
                      <Box ml='' style={{cursor: 'pointer'}}>
                        <DropdownComponent toggle={CustomToggle} dropdownItemsActions={[[
                          'Delete',
                          () => {
                            fetchDeletePost(details.id, (response, status) => {
                                if (status === 200) {
                                  window.location.href = '/'
                                  makeToast(toast, 'postDeleted', '', 'Post deleted successfully', 'info', 5000, 'bottom-right')
                                } else {
                                  errorToast(toast)
                                }
                            })
                            }
                        ]]} />
                      </Box>
                  )}
                  </HStack>

                  <hr />
                  {details.description.length > 0 && <>
                    <HStack spacing={5}>
                    <Avatar size='sm' src={details.user.profile_image} name={details.user.username} border='1px solid #4299e1'
                      cursor='pointer' onClick={() => window.location.href = `/accounts/${details.user.id}`} />
                    <Text fontWeight='bold' cursor='pointer' onClick={() => window.location.href = `/accounts/${details.user.id}`}>{details.user.username}</Text>
                    <Text>{details.description.substring(0, 50)}{details.description.length > 50 && '...'}
                      {details.description.length > 50 && <PopoverComponent btn='[See all]' header='POST DESCRIPTION' body={details.description} />}
                      </Text>
                  </HStack>
                  <br />
                  </>}
              </VStack>
                  
              <div style={{height: details.description.length > 0 ? '300px' : '400px', width: '100%', overflowY: 'scroll'}}>
                  <GeneralCommentList objs={comments} setSelectedComment={setSelectedComment} userId={userId} funcAfterDelete={setComments}
                  toast={toast} fake={fake} setFake={setFake} fetchLikeObjToggle={fetchLikeCommentToggle} fetchDeleteObj={fetchDeletePostComment} />
              </div>

              <PostActions post={details} fake={fake} setFake={setFake} isDetail />

              <Text fontWeight='bold' align='left' ml='3'>{details.likes.length} {details.likes.length === 1 ? 'like' : 'likes'}</Text>
              <Text fontSize='xs' align='left' ml='3'>{timeSince(new Date(details.created_at))} AGO</Text>
              <br /><hr />
              <PostInput post={details} comment={comment} setComment={setComment} toast={toast} postDetail comments={comments} setComments={setComments} />
            </Box>
          </Box>

          <CommentReplyModal selectedComment={selectedComment} setSelectedComment={setSelectedComment} commentReply={commentReply}
          setCommentReply={setCommentReply} toast={toast} replyList={
            <GeneralCommentList objs={selectedComment?.replies} setSelectedComment={setSelectedComment} userId={userId} funcAfterDelete={setSelectedComment}
              toast={toast} fake={fake} setFake={setFake} fetchLikeObjToggle={fetchLikeReplyToggle} fetchDeleteObj={fetchDeletePostCommentReply} isReply />
          } />
        </Box><br />
      </>}
    </>
  )
}

export default PostDetailPage