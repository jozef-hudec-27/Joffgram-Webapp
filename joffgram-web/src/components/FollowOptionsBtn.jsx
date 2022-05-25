import React from 'react'
import { Button } from '@chakra-ui/react'


const FollowOptionsBtn = ({ onBtnClick, action }) => {
  return (
    <Button variant='link' colorScheme='blue' mt='1' ml='20' fontWeight='bold' onClick={onBtnClick}>
        {action}
    </Button>
  )
}

export default FollowOptionsBtn