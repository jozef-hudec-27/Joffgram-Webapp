import React from 'react'
import { WrapItem, Avatar, Stack, Text, Button } from '@chakra-ui/react'


const AccBadge = ({ acc, setSeeCreatePostModal }) => {
  return <WrapItem m='1' mt='10'>
        <Avatar src={acc?.profile_image} name={acc?.username} size='lg' style={{cursor: 'pointer', border: '1px solid grey'}} onClick={() => window.location.href = '/accounts/' + acc?.id} />
        <Stack direction='column' ml='3' mt='3' spacing={3}>
            <Text style={{cursor: 'pointer'}} onClick={() => window.location.href = '/accounts/' + acc?.id}>{acc?.username}</Text>
            <Text as='sup' color='grey'>{acc?.fullname}</Text>
        </Stack>
        <Stack direction='column' ml='20' mt='3' spacing={3}>
            <Button variant='link' colorScheme='blue' style={{fontWeight: 'bold'}}
                onClick={() => window.location.href = '/accounts/' + acc?.id}>Profile</Button>
            <Button variant='link' colorScheme='blue' style={{fontWeight: 'bold'}}
                onClick={() => setSeeCreatePostModal(true)}>Create post</Button>
        </Stack>
    </WrapItem>
}

export default AccBadge