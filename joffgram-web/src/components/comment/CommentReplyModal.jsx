import React from 'react'
import { fetchCreatePostCommentReply, errorToast } from '../../utils'
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Text, InputGroup, Input, InputRightElement } from '@chakra-ui/react'


const CommentReplyModal = ({ selectedComment, setSelectedComment, replyList, commentReply, setCommentReply, toast }) => {
  return (
    <Modal isOpen={selectedComment !== null} onClose={() => setSelectedComment(null)} size='xl'>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>{selectedComment?.user?.username}'s comment replies</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <div style={{overflowY: 'scroll', height: '400px'}} >
                    {selectedComment?.replies?.length > 0 ? replyList : <Text as='sup'>This comment has no replies. Be the first to reply!</Text>}
                </div>

            <InputGroup>
                <Input variant='flushed' placeHolder='Add reply...' value={commentReply} onChange={e => setCommentReply(e.target.value)} />
                <InputRightElement>
                <Text color='blue.400' style={{cursor: (commentReply.length > 0 && commentReply[0] !== ' ') ? 'pointer' : 'not-allowed'}} mr='3'
                    opacity={(commentReply.length > 0 && commentReply[0] !== ' ') ? '1' : '0.5'} onClick={e => {
                    if (commentReply.length > 0 && commentReply[0] !== ' ') {
                        fetchCreatePostCommentReply(selectedComment.id, commentReply, (response, status) => {
                        if (status === 201) {
                            selectedComment.replies = [ response ].concat([ ...selectedComment.replies ])
                            setCommentReply('')
                        } else {
                            errorToast(toast)
                        }
                        })
                    }
                    }}>Post</Text>
                </InputRightElement>
            </InputGroup>

            <br /><br />
            </ModalBody>
        </ModalContent>
    </Modal>
  )
}

export default CommentReplyModal