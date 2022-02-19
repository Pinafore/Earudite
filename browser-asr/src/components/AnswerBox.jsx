import "../styles/AnswerBox.css";
import { useState, useEffect, useRef } from "react";
import { useOnlineAnswering } from "asr-answering";
import MicOffIcon from "@material-ui/icons/MicOff";
import { useRecoilValue } from "recoil";
import { AUTHTOKEN, PROFILE, URLS, SOCKET } from "../store";
import { useAlert } from "react-alert";
import axios from "axios";

function useKeyPress(targetKey, fnCall, deps, condition) {
  const [keyPressed, setKeyPressed] = useState(false);
  function downHandler({ key }) {
    if (key === targetKey) {
      setKeyPressed(true);
    }
  }
  const upHandler = ({ key }) => {
    if ((key === targetKey) && condition) {
      fnCall();
      setKeyPressed(false);
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps]);
  return keyPressed;
}

function VoiceButtonVolume(props) {
  const volumeRange = [20,80];
  return (
    <div class="answerbox-voicebutton-volume-wrapper">
      <div class="answerbox-voicebutton-volume-slider" style={{"height":((Math.min(Math.max(volumeRange[0],props.volume),volumeRange[1])-volumeRange[0])/(volumeRange[1]-volumeRange[0])*0.3+0.4).toString()+"rem"}}></div>
      <div class="answerbox-voicebutton-volume-slider" style={{"height":((Math.min(Math.max(volumeRange[0],props.volume),volumeRange[1])-volumeRange[0])/(volumeRange[1]-volumeRange[0])*1.1+0.4).toString()+"rem"}}></div>
      <div class="answerbox-voicebutton-volume-slider" style={{"height":((Math.min(Math.max(volumeRange[0],props.volume),volumeRange[1])-volumeRange[0])/(volumeRange[1]-volumeRange[0])*0.3+0.4).toString()+"rem"}}></div>
    </div>
  )
}

function VoiceButton(props) {

  function handleChange() {
    if(props.canClassify) props.setMode(m => ((m+1)%3));
    else props.setMode(m => ((m+1)%2));
    
    if(props.mode === 0) { // off

    } else if(props.mode === 1) { // ASR

    } else { // mode === 2, classifier

    }
  }

  if(props.mode === 0) {
    return (
      <div class="answerbox-voicebutton-wrapper answerbox-hvr-grow" onClick={handleChange}>
        <MicOffIcon
          style={{
            color: "white",
            width: "60%",
            height: "60%",
          }}
        />
      </div>
    )
  } else if(props.mode === 1) {
    return (
      <div class="answerbox-voicebutton-wrapper answerbox-hvr-grow" style={{"background-color":"#6287F6"}} onClick={handleChange}>
        <VoiceButtonVolume volume={props.volume}/>
      </div>
    )
  } else {
    return (
      <div class="answerbox-voicebutton-wrapper answerbox-hvr-grow" style={{"background-color":"#90E99C"}} onClick={handleChange}>
        <VoiceButtonVolume volume={props.volume}/>
      </div>
    )
  }
  
}

async function initialize2(foo) {
  await foo();
}


// Hook for the answer box at the bottom of all games
function AnswerBox(props) {
  const profile = useRecoilValue(PROFILE);
  const username = profile["username"];
  const urls = useRecoilValue(URLS);
  const authtoken = useRecoilValue(AUTHTOKEN);
  const alert = useAlert();
  const socket = useRecoilValue(SOCKET);

  const [speechMode, setSpeechMode] = useState(0);

  // ASR always picks up the wake word, this function removes it
  function complete(answer) {
    props.setAnswer(answer.substr(answer.indexOf(" ") + 1).replace("stop", ""));
  }

  // Sets answer when typed
  function setAnswer2(event) {
    props.setAnswer(event.target.value);
  }

  const textAnswer = useRef(null);

  function buzzin() {
    props.buzz();
    setTimeout(()=>{textAnswer.current.focus();}, 100);
  }

  // useEffect(()=> {
  //   console.log(props.answer);
  // },[props.answer]);

  function submit1() {
    console.log(props.answer);
    props.submit(props.answer);
    props.setAnswer("");
  }

  const {
    initialize,
    startListening,
    setIsReady,
    // eslint-disable-next-line
    stopListening,
    // eslint-disable-next-line
    listening,
    // eslint-disable-next-line
    recordingState,
    // eslint-disable-next-line
    timeLeft,
    // eslint-disable-next-line
    voiceState,
    // eslint-disable-next-line
    volumeUnused,
    // eslint-disable-next-line
    answer,
    // eslint-disable-next-line
    permissions,
    // eslint-disable-next-line
    error,
    // eslint-disable-next-line
    errormsg,
  } = useOnlineAnswering({
    audio: {
      buzzin:
        "https://assets.mixkit.co/sfx/download/mixkit-game-show-wrong-answer-buzz-950.wav",
      buzzout:
        "https://assets.mixkit.co/sfx/download/mixkit-game-show-wrong-answer-buzz-950.wav",
    },
    onAudioData: () => {},
    timeout: 6000,
    isReady: (speechMode > 0),
    onComplete: async (answer, blob) => {
      if (speechMode === 2) {
        const formdata = new FormData();
        formdata.append("audio", blob);
        formdata.append("auth", authtoken);

        console.log(blob);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "test.wav";
        document.body.appendChild(a);
        a.click();

        const config = {
          headers: { "content-type": "multipart/form-data" },
        };

        //POST TO CLASSIFIER SERVER
        // const response = 
        await axios
          .post(urls["socket_flask"] + "/audioanswerupload", formdata, config)
          .then((response) => {
            console.log(response);
            socket.emit("audioanswer", {
              auth: authtoken,
              filename: response.data["filename"], // CHANGE
            });
          })
          .catch(() => {
            alert.error("Classification submission failed");
          });
      } else {
        complete(answer);
      }
    },
    gameTime: 9000000,
    onBuzzin: () => buzzin(),
    ASRthreshold: 0.8,
  });

  useEffect(()=> {
    setIsReady(speechMode > 0);
    console.log((speechMode > 0));
  },[speechMode]);

  useEffect(() => {
    if(props.buzzer !== username) {
      props.setAnswer("");
    }
  }, [props,username])

  useEffect(()=> {
    initialize2(initialize);
    startListening();
    // eslint-disable-next-line
  },[]);

  useKeyPress("Enter", submit1, [props.answer], true);
  useKeyPress(" ", buzzin, [], document.activeElement !== textAnswer.current);

  const [volume, setVolume] = useState(0);
  
  useEffect(() => {
    async function getVolume() {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true
          }
        });
        const audioContext = new AudioContext();
        const audioSource = audioContext.createMediaStreamSource(audioStream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.minDecibels = -127;
        analyser.maxDecibels = 0;
        analyser.smoothingTimeConstant = 0.4;
        audioSource.connect(analyser);
        const volumes = new Uint8Array(analyser.frequencyBinCount);
        const volumeCallback = () => {
          analyser.getByteFrequencyData(volumes);
          let volumeSum = 0;
          for(const volume of volumes)
            volumeSum += volume;
          setVolume(volumeSum / volumes.length);
        };
        const volumeInterval = setInterval(() => {
          volumeCallback();
        }, 100);
        return () => clearInterval(volumeInterval);
      } catch(e) {
        setSpeechMode(0);
        console.error("Microphone not detected: ", e);
        alert.error('Microphone not detected');
      }
    }
    getVolume();
  }, [alert]);

  return (
    <div class="answerbox-answering-bigger-wrapper">
      <div class="answerbox-answering-wrapper">
        <input
          disabled={props.buzzer !== username}
          type="text"
          name="name"
          value={props.answer}
          onChange={setAnswer2}
          className={"answerbox-textbox-text"}
          ref={textAnswer}
          autocomplete="off"
        />
        <div class="answerbox-switch-wrapper">
          <VoiceButton mode={speechMode} setMode={setSpeechMode} volume={volume}/>
        </div>
        
        {/* <div class="answerbox-switch-wrapper">
          <Tooltip
            // options
            title="Use voice commands"
            position="top"
            trigger="mouseenter"
            unmountHTMLWhenHide="true"
          >
            <VoiceBuzzSwitch setVoice={setReady2} />
          </Tooltip>
          {ready && props.classifiable && (
            <div>
              <Tooltip
                // options
                title="Use classifier"
                position="top"
                trigger="mouseenter"
                unmountHTMLWhenHide="true"
              >
                <UseClassifierSwitch setVoice={setUseClassifier} />
              </Tooltip>
            </div>
          )}
        </div> */}

        <div class="answerbox-button" onClick={buzzin}>
          Buzz
        </div>
        <div class="answerbox-button" onClick={submit1}>
          Submit
        </div>
      </div>
      {speechMode === 1 &&
        <div class="answerbox-answering-voice-instructions">
          Speech Recognition: Say
          <div class="answerbox-answering-voice-instructions-highlight">Go</div> 
          to begin,
          <div class="answerbox-answering-voice-instructions-highlight">Stop</div>  
          for the transcript, press 
          <div class="answerbox-answering-voice-instructions-btn-highlight">Submit</div>
          to submit
        </div>
      }
      {speechMode === 2 &&
        <div class="answerbox-answering-voice-instructions">
          Classifier: Say 
          <div class="answerbox-answering-voice-instructions-highlight">Go</div> 
          to begin recording audio, say  
          <div class="answerbox-answering-voice-instructions-highlight">Stop</div>  
          to submit and classify (judge via audio)
        </div>
      }
    </div>
  );
}

export default AnswerBox;
