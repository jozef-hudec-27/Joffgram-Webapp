import React from 'react'
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, HStack, Avatar, VStack, Text, Button } from '@chakra-ui/react'
import { fetchSharePost } from '../../utils'


const SharePostModal = ({ isOpen, onClose, myFriends, post }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Share Post</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                {myFriends?.length === 0 && <Text as='sup'>You have no friends.</Text>}

                {myFriends?.map(friend => (
                    <>
                        <HStack spacing={20}>
                            <HStack spacing={2} cursor='pointer' onClick={() => window.location.href = '/accounts/' + friend.id }>
                                <Avatar name={friend.username} src={friend.profile_image} border='1px solid grey' />
                                <VStack spacing={1}>
                                    <Text fontWeight='bold'>{friend.username}</Text>
                                    <Text as='sup'>{friend.fullname}</Text>
                                </VStack>
                            </HStack>

                            <Button id={`shareButton_${friend.id}`} colorScheme='blue' variant='link' onClick={() => {
                                fetchSharePost(post.id, friend.id, window.location.origin, (response, status) => {
                                    if (status === 201) {
                                        document.getElementById(`shareButton_${friend.id}`).className = 'd-none'
                                    } else {
                                        console.log('Error sharing post to ', friend.username)
                                    }
                                })
                            }}>
                                Send
                            </Button>
                        </HStack>
                        <br />
                    </>
                ))}
            </ModalBody>
        </ModalContent>
    </Modal>
  )
}

export default SharePostModal