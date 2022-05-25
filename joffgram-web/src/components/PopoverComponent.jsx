import React from 'react'
import { Popover, PopoverTrigger, Button, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody } from '@chakra-ui/react'


const PopoverComponent = ({ btn, header, body }) => {
  return <Popover>
        <PopoverTrigger>
            <Button variant='link' colorScheme='blue'>{btn}</Button>
        </PopoverTrigger>
        <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>{header}</PopoverHeader>
            <PopoverBody>{body}</PopoverBody>
        </PopoverContent>
    </Popover>
}

export default PopoverComponent