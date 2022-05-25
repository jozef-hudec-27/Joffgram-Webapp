import React from 'react'
import { AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Button } from '@chakra-ui/react'


const AlertDialogComponent = ({ isOpen, onClose, header, body, cancelBtnName, mainBtn}) => {
  return (
    <AlertDialog isOpen={isOpen} onClose={onClose}>
        <AlertDialogOverlay>
            <AlertDialogContent>
                <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                    {header}
                </AlertDialogHeader>

                <AlertDialogBody>
                    {body}
                </AlertDialogBody>

                <AlertDialogFooter>
                    <Button onClick={onClose}>
                        {cancelBtnName}
                    </Button>
                    
                    {mainBtn}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialogOverlay>
    </AlertDialog>
  )
}

export default AlertDialogComponent