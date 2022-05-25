import React from 'react'
import Picker from 'emoji-picker-react';


const EmojiPickerComponent = ({ onEmojiClick }) => {
  return (
    <div style={{ position: 'absolute' }}>
        <Picker disableSkinTonePicker native onEmojiClick={onEmojiClick} />
    </div>
  )
}

export default EmojiPickerComponent