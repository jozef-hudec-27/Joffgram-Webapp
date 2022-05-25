import React, { useEffect, useState } from 'react'
import { Box, HStack, Avatar, CircularProgress, CircularProgressLabel, Text } from '@chakra-ui/react';
import { BsFillPlayFill, BsFillPauseFill } from 'react-icons/bs'
import { AiOutlineClose, AiOutlineFileExclamation } from 'react-icons/ai'
import { timeSince } from '../../utils';


const MessageComponent = ({ message, userId, setSelectedMessage, theirDetails, videoFormats, imageFormats, audioFormats,
  playingVoiceMessageId, setPlayingVoiceMessageId }) => {

  let messageFileExtension;
  if (message.file) {
    messageFileExtension = message.file.split(':')[2].split('.')[1]
  }
  const [fake, setFake] = useState(0)
  const [messageInterval, setMessageInterval] = useState(null)

  useEffect(() => {
    if (message.id === playingVoiceMessageId) {
      setMessageInterval(setInterval(() => setFake(Math.random), 100))
    } else {
      if (messageInterval !== null) {
        clearInterval(messageInterval)
        setMessageInterval(null)
      }
    }

    return () => {
      if (messageInterval !== null) {
        clearInterval(messageInterval)
      }
    }
  }, [playingVoiceMessageId])

  return <Box className='message' borderRadius='20px' border='1px solid grey' bg={message?.user?.id.toString() === userId && '#f0f0f0'} m='5'
      p='3' align='left' w='90%'>
      {message?.user?.id?.toString() === userId && (message?.body || message?.file) && <Box align='right'>
          <AiOutlineClose size={10} cursor='pointer' onClick={() => setSelectedMessage(message)} />
        </Box>
      }

      <HStack>
          {message?.user?.id?.toString() !== userId && <Avatar m='1' src={message?.user?.profile_image} border='1px solid grey'
          cursor='pointer' onClick={() => window.location.href = '/accounts/' + theirDetails?.id}/>}
          {message.file && (
            <>
              {/* THE FILE IS A VIDEO */}
              {videoFormats.includes(messageFileExtension) && <video controls style={{height: '500px'}}>
                  <source src={message.file} type={`video/${messageFileExtension}`} />
              </video>}

              {/* THE FILE IS AN IMAGE */}
              {imageFormats.includes(messageFileExtension) && <img src={message.file} style={{height: '250px'}} />}

              {/* THE FILE IS AN AUDIO */}
              {audioFormats.includes(messageFileExtension) && <>
                <audio controls src={message.file} id={`voice_message_${message.id}`} class='d-none' />
                <CircularProgress min={0} max={document.getElementById(`voice_message_${message.id}`)?.duration}
                  value={document.getElementById(`voice_message_${message.id}`)?.currentTime} color='red.500'>
                    <CircularProgressLabel>
                      <Box align='center'>
                        {playingVoiceMessageId !== message.id ?
                          <BsFillPlayFill color='red' size={35} cursor='pointer' onClick={() => {
                            const messagePlayer = document.getElementById(`voice_message_${message.id}`)

                            if (playingVoiceMessageId === null) {
                              setPlayingVoiceMessageId(message.id)
                              messagePlayer.play()
                            } else { // if one voice message is already playing in the background
                              document.getElementById(`voice_message_${playingVoiceMessageId}`).pause()
                              setPlayingVoiceMessageId(message.id)
                              messagePlayer.play()
                            }
                          }}/>
                          :
                          <BsFillPauseFill color='red' size={35} cursor='pointer' onClick={() => {
                            const messagePlayer = document.getElementById(`voice_message_${message.id}`)
                            setPlayingVoiceMessageId(null)
                            messagePlayer.pause()
                          }} />
                        }
                      </Box>
                    </CircularProgressLabel>
                </CircularProgress>
                <Box>

                </Box>
              </>}

              {/* THE FILE IS NOT SUPPORTED */}
              {!(videoFormats.includes(messageFileExtension)) && !(imageFormats.includes(messageFileExtension)) && !(audioFormats.includes(messageFileExtension))&& <HStack>
                <AiOutlineFileExclamation size={35} />
                <Text as='i'>File type not supported.</Text>
              </HStack>}
            </>
          )}
          {message?.body?.startsWith(window.location.origin) ? <a href={message?.body}>{message?.body}</a> : <Text>{message?.body}</Text>}
          {!message?.body && !message?.file && <Text as='i'>This message has been deleted.</Text>}
      </HStack>

    <Text as='sub' opacity='0.5'>{timeSince(new Date(message?.created_at))} AGO</Text>
</Box>  
}

export default MessageComponent