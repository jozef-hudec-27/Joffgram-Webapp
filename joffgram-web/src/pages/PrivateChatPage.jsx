import React, { useState, useEffect } from 'react'
import { fetchGetAccountDetail, fetchGetPrivateChatMessages, makeToast, isFileSizeValid, fetchReadMyUnreadMessagesInChat } from '../utils'
import Loading from '../components/Loading'
import AlertComponent from '../components/AlertComponent'
import { Box, Text, Avatar, HStack, Input, InputGroup, InputRightElement, InputLeftElement, IconButton, useToast, Button } from '@chakra-ui/react'
import { Drawer, DrawerBody, DrawerOverlay, DrawerContent } from '@chakra-ui/react'
import { BsArrowBarLeft } from 'react-icons/bs'
import MessageList from '../components/messages/MessageList'
import { CgImage } from 'react-icons/cg'
import { AiOutlineSmile } from 'react-icons/ai'
import EmojiPickerComponent from '../components/EmojiPickerComponent'
import RecordVoiceComponent from '../components/RecordVoiceComponent'
import AlertDialogComponent from '../components/AlertDialogComponent'


const PrivateChatPage = ({ dataset }) => {
    const { userId, username, path } = dataset
    let theirId = path.split('/')[2]
    const [chatSocket, setChatSocket] = useState(null)
    const [theirDetails, setTheirDetails] = useState(null)
    const [error, setError] = useState(false)
    const [messages, setMessages] = useState(null)
    const [message, setMessage] = useState('')
    const toast = useToast()
    const [selectedMessage, setSelectedMessage] = useState(null)
    const [seeEmojiPicker, setSeeEmojiPicker] = useState(false)
    const [voiceMessageFile, setVoiceMessageFile] = useState(null)

    const onEmojiClick = (event, emojiObject) => {
      setMessage(message + emojiObject.emoji)
    };

    useEffect(() => {
      fetchReadMyUnreadMessagesInChat((response, status) => {
      }, theirId)

      fetchGetAccountDetail(theirId, (response, status) => {
        if (status === 200) {
          setTheirDetails(response)
        } else {
          setError(true)
        }
      })

      fetchGetPrivateChatMessages(theirId, (response, status) => {
        if (status === 200) {
          setMessages(response)
        } else {
          setError(true)
        }
      })
      
      const cSocket = new WebSocket('ws://' + '127.0.0.1:8000' + '/ws/chat/private/' + `${userId}w${theirId}/`)

      cSocket.onopen = e => {
        setError(false)
          setChatSocket(cSocket)
      }

      cSocket.onclose = e => {
          setError(true)
      }
    }, [])

    useEffect(() => {
      document.getElementById("chooseFileInput")?.addEventListener("change", handleSelectFile, false);
      function handleSelectFile() { 
        const reader = new FileReader
        reader.onload = e => {
          const file = e.target.result

          let base64FileString, extension;
          [base64FileString, extension] = isFileSizeValid(file)

          if (base64FileString !== null) {
            chatSocket.send(JSON.stringify({
              'file': base64FileString,
              'extension': extension,
              'name': username,
              'message': ''
            }))
          } else {
            makeToast(toast, 'bigFile', '', 'File cannot be bigger than 10MB.', 'info', 5000, 'bottom-right')
          }

        }
        reader.readAsDataURL(this.files[0])
      }
    }, [document.getElementById("chooseFileInput")])

    const handleSubmitNewMessage = () => {
      if (message !== '' && message[0] !== ' ' && chatSocket !== null && message.length <= 500) {
        chatSocket.send(JSON.stringify({
          'message': message,
          'name': username
        }))
      } else {
        makeToast(toast, 'cannotCreateMessage', '', "Your message can't be empty and be longer than 500 characters.", 'info', 5000, 'bottom-right')
      }
    }
  
    if (chatSocket !== null) {
  
      chatSocket.onmessage = e => {
        const { message, name, type, created_at, user_pfp_url, user_id, file, updated_messages, id } = JSON.parse(e.data);   
        if (updated_messages) {
          setMessages(updated_messages)
        } else {
          if (type === 'private_chat_message') {
            const newMsg = {id: id, body: message, file: file, 'user': {username: name, profile_image: 'http://127.0.0.1:8000' + user_pfp_url, id: user_id }, created_at: created_at}
            
            setMessages([ newMsg ].concat([ ...messages ]))
            setMessage('')
          }
        }
      };
      }  
   
  return (
    <>
      <br /><br /><br /><br />
      {!error && chatSocket === null && <Loading />}
      {error === true && <AlertComponent status='error' title='Chat not found!' description='Make sure the user exists and you mutually follow each other.' />}
      {chatSocket !== null && !error && <>
          <Box align='center'><br />
              <Box style={{height: '700px', width: '730px'}} border='1px solid grey' borderRadius='20px'>
                <HStack spacing={500}>
                  <HStack spacing={3} m='3' cursor='pointer' onClick={() => window.location.href = '/accounts/' + theirDetails?.id}>
                    <Avatar src={theirDetails?.profile_image} name={theirDetails?.username} border='1px solid grey' />
                    <Text fontWeight='bold'>{theirDetails?.username}</Text>
                  </HStack>

                  <IconButton
                      colorScheme='blue'
                      aria-label='Back'
                      icon={<BsArrowBarLeft />}
                      onClick={() => window.location.href = '/accounts/' + theirDetails?.id}
                    />
                </HStack>

                <hr />

                <div style={{ overflowY: 'scroll', height: '500px' }}>
                  <MessageList messages={messages} userId={userId} theirDetails={theirDetails} setSelectedMessage={setSelectedMessage} />
                </div>

              <InputGroup>
                <InputLeftElement mt='14' ml='3'>
                  <RecordVoiceComponent  setVoiceMessageFile={setVoiceMessageFile} voiceMessageFile={voiceMessageFile} socket={chatSocket} username={username} />
                </InputLeftElement>

                <form onSubmit={e => {
                  e.preventDefault()
                  handleSubmitNewMessage()
                }}>
                  <Input width='580px' variant='flushed' size='lg' placeholder='Say something... (max. 500 characters)' mt='10' value={message} onChange={e => {
                    setMessage(e.target.value)
                }} ml='16'/>
                
                </form>
                
                <InputRightElement mt='14' mr='4'>
                    <HStack>
                      <CgImage size={25} cursor='pointer' onClick={() => {
                        document.getElementById('chooseFileInput').click()
                      }} />
                      <AiOutlineSmile size={25} cursor='pointer' onClick={() => setSeeEmojiPicker(!seeEmojiPicker)} />
                    </HStack>
                </InputRightElement>
              </InputGroup>

              </Box><br />

              <AlertDialogComponent isOpen={selectedMessage !== null} onClose={() => setSelectedMessage(null)} header='Delete Message'
                body="Are you sure? You can't undo this action afterwards." cancelBtnName='Cancel' mainBtn={
                  <Button colorScheme='red' onClick={() => {
                    chatSocket.send(JSON.stringify({
                      'message_id': selectedMessage.id
                    }))
                    setSelectedMessage(null)
                  }} ml={3}>
                    Delete
                  </Button>
                } />
            
              <Drawer isOpen={seeEmojiPicker} placement='left' onClose={() => setSeeEmojiPicker(false)}>
                <DrawerOverlay />
                <DrawerContent>
                  <DrawerBody>
                      <EmojiPickerComponent onEmojiClick={onEmojiClick} />
                  </DrawerBody>
                </DrawerContent>
              </Drawer>

          </Box>
      </>}

      <form>
        <input className='d-none' type='file' id='chooseFileInput' />
      </form>
    </>
  )
}

export default PrivateChatPage