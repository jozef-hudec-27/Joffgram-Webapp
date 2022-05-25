import React, { useState } from 'react'
import MessageComponent from './MessageComponent'


const MessageList = ({ messages, userId, theirDetails, setSelectedMessage }) => {
  const videoFormats = ['mp4', 'ogg', 'webm']
  const imageFormats = ['jpeg', 'gif', 'png', 'apng', 'svg', 'bmp', 'jpg']
  const audioFormats = ['mp3', 'mpeg', 'wav']
  const [playingVoiceMessageId, setPlayingVoiceMessageId] = useState(null)

  return (
    <>
        {messages?.map(message => (
            <MessageComponent message={message} userId={userId} setSelectedMessage={setSelectedMessage} theirDetails={theirDetails}
                videoFormats={videoFormats} imageFormats={imageFormats} audioFormats={audioFormats}
                playingVoiceMessageId={playingVoiceMessageId} setPlayingVoiceMessageId={setPlayingVoiceMessageId} />
        ))}
    </>
  )
}

export default MessageList