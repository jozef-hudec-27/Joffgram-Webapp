import React from 'react'
import MicRecorder from 'mic-recorder-to-mp3';
import { IconButton, Box, ButtonGroup, Text } from '@chakra-ui/react'
import { AiOutlinePauseCircle, AiOutlineAudio, AiOutlineSend } from 'react-icons/ai'
import { HiOutlineTrash } from 'react-icons/hi'
import { isFileSizeValid, getBase64StringFromFile } from '../utils';


const Mp3Recorder = new MicRecorder({ bitRate: 128 });

class RecordVoiceComponent extends React.Component {
  constructor(props) {
    super(props);
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    this.state = {
      isRecording: false,
      isPaused: false,
      isBlocked: false,
      seeAction: false,
      audioFile: null,
      audioFileBase64: null
    };
  }

  startRecording = () => {
    Mp3Recorder.start()
      .then(() => {
        this.setState({ isRecording: true });
      })
      .catch(e => console.error(e));
  };

  stopRecording = () => {
    this.setState({ isRecording: false, seeAction: true });
    Mp3Recorder.stop()
      .getMp3()
      .then(async ([buffer, blob]) => {
        const file = new File(buffer, 'audio.mp3', {
          type: blob.type,
          lastModified: Date.now()
        });
        
        this.props.setVoiceMessageFile(file) 
      })
      .catch(e => console.log(e));
  };

  render() {
    const { isRecording, seeAction } = this.state;
    return (
      <Box>
        {!seeAction && <IconButton onClick={() => {
          if (isRecording) {
            this.stopRecording()
          } else {
            this.startRecording()
          }
        }} icon={isRecording ? <AiOutlinePauseCircle size={20} /> : <AiOutlineAudio size={20} />} colorScheme='blue' size='sm' />}

          {seeAction &&
          <ButtonGroup size='sm' isAttached variant='outline' m='1' colorScheme='blue'>
            <IconButton icon={<HiOutlineTrash />} onClick={() => {
              this.setState({ seeAction: false })
              this.props.setVoiceMessageFile(null)
            }} />
            <IconButton icon={<AiOutlineSend />} onClick={() => {
              this.setState({ seeAction: false })
            
              let base64FileString, extension;
              getBase64StringFromFile(this.props.voiceMessageFile)
                .then(data => {
                  [base64FileString, extension] = isFileSizeValid(data)
                  this.props.socket.send(JSON.stringify({
                    'file': base64FileString,
                    'extension': extension,
                    'name': this.props.username,
                    'message': ''
                  }))
                })
                .catch(error => {
                  console.log('ERROR: COULD NOT SEND VOICE MESSAGE: ', error)
                })

              this.props.setVoiceMessageFile(null)
            }} />
          </ButtonGroup>
          }

        {this.state.isRecording && <>
          <br />
          <Text as='sup' color='red'>recording...</Text>
        </>}
      </Box>
    );
  }
}

export default RecordVoiceComponent