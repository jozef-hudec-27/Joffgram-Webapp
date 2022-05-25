import React from 'react'
import { Alert, AlertIcon, AlertTitle,  AlertDescription } from '@chakra-ui/react'


const AlertComponent = ({ status, title, description }) => {
    return <div>
        <Alert status={status}>
        <AlertIcon />
        <AlertTitle mr={2}>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
        </Alert>
  </div>
}

export default AlertComponent