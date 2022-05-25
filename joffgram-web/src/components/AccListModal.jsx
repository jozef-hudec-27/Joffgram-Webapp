import { Box, VStack, HStack, Text, Button, Avatar, useToast } from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import ModalComponent from './ModalComponent'
import axios from 'axios'
import { fetchRemoveFollower, makeToast } from '../utils'


const AccListModal = ({ users, nextUsersUrl, isOpen, onClose, header,     isFollowerList, setFollowers, isSelf, details }) => {

    const [accList, setAccList] = useState([])
    const [nextUrl, setNextUrl] = useState(null)
    const toast = useToast()

    useEffect(() => {
        setAccList(users)
        setNextUrl(nextUsersUrl)
    }, [users, nextUsersUrl])
     
  return (
    <ModalComponent isOpen={isOpen} onClose={onClose} size='md' body={
        <Box align='center'>
            <div style={{overflowY: 'scroll', height: '400px'}}>
                <VStack spacing={4}>
                    {accList.map(acc => (
                        <Box>
                            <HStack spacing={3}>
                                <Avatar src={acc.profile_image} name={acc.username} border='1px solid grey' cursor='pointer' onClick={() => window.location.href = '/accounts/' + acc.id} />
                                <VStack spacing={1} cursor='pointer' onClick={() => window.location.href = '/accounts/' + acc.id}>
                                    <Text fontWeight='bold'>{acc.username}</Text>
                                    <Text>{acc.fullname}</Text>
                                </VStack>
                                {isFollowerList && isSelf && <Button variant='link' fontSize='xs' colorScheme='red' onClick={e => {
                                    e.preventDefault()
                                    fetchRemoveFollower(acc.id, (response, status) => {
                                        if (status === 200) {
                                            details.followers = response
                                            setFollowers(response)
                                            makeToast(toast, 'removedFollower', '', `Removed ${acc.username} from followers.`, 'info', 5000, 'bottom-right')
                                        } else {
                                            makeToast(toast, 'cannotRemoveFollower', 'Error!', 'Could not remove follower. Please try again later.',
                                            'error', 5000)
                                        }
                                    })
                                }}>Remove</Button>}
                            </HStack>
                        </Box>
                    ))}
                </VStack><br />
              
                {nextUrl && <Button variant='solid' onClick={() => {
                  axios.get(nextUrl)
                    .then(data => {          
                        accList([ ...accList ].concat(data.data.results))
                        setNextUrl(data.data.next)
                    })  
                }} colorScheme='blue'>
                    Load more
                </Button>}
            </div>
        </Box>
    } isAccList header={header} />
  )
}

export default AccListModal