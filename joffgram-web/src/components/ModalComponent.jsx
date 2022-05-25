import React, { useEffect } from 'react'
import { Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, ModalHeader } from '@chakra-ui/react'


const ModalComponent = ({ isOpen, onClose, size, body, isAccList, header, fake, setFake }) => {

  useEffect(() => {
    if (fake) {
      setFake(fake+1)
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size}>
        <ModalOverlay />
        <ModalContent>
        {header && <ModalHeader align='center'>{header}</ModalHeader>}
          {!isAccList && <ModalCloseButton />}
          <ModalBody>
            {body}
          </ModalBody>
        </ModalContent>
    </Modal>      
  )
}

export default ModalComponent