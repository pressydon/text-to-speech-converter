var voiceList = document.querySelector('#voiceList');
var txtInput = document.querySelector('#txtInput');
var btnSpeak = document.querySelector('#btnSpeak');

//getting the speech synthesis
var tts = window.speechSynthesis;
var voices = [];

getVoicesFunc();

if(speechSynthesis !== undefined){
    speechSynthesis.onvoiceschanged = getVoicesFunc;
}
btnSpeak.addEventListener('click', ()=>{
    var toSpeak = new SpeechSynthesisUtterance(txtInput.value);
    var selectedVoiceName = voiceList.selectedOptions[0].getAttribute('data-name');
    voices.forEach(voice =>{
        if(voice.name === selectedVoiceName){
            toSpeak.voice = voice;
        }
    })
    tts.speak(toSpeak);
});

function getVoicesFunc(){
    voices = tts.getVoices();
    //console.log(voices)
    voiceList.innerHTML = ``;
    voices.forEach((voice)=>{
        //console.log(voice)
        var listItem =document.createElement('option');
        listItem.textContent = voice.name;
        listItem.setAttribute('data-lang', voice.lang);
        listItem.setAttribute('data-name', voice.name);
        voiceList.appendChild(listItem);
    });
    voiceList.selectedIndex = 0;
}

//voice recorder

class  VoiceRecorder{
    constructor(){
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
            console.log('Get user media supported');
        } else{
            console.log('Get user media Not supported')
        }

        this.mediaRecorder
        this.stream
        this.chunks = [];
        this.isRecording = false

        this.recorderRef = document.querySelector('#recorder');
        this.playerRef = document.querySelector('#player');
        this.startRef = document.querySelector('#start');
        this.stopRef = document.querySelector('#stop');


        this.startRef.onclick = this.startRecording.bind(this);
        this.stopRef.onclick = this.stopRecording.bind(this);

        this.constraints = {
            audio: true,
            video: false
        } 

    }

    //handle success

    handleSuccess(stream){
        this.stream = stream;
        this.stream.oninactive = ()=>{
            console.log("stream ended")
        }
        this.recorderRef.srcObject = this.stream;
        this.mediaRecorder = new MediaRecorder(this.stream);
        this.mediaRecorder.ondataavailable = this.onMediaRecorderDataAvailable.bind(this);
        this.mediaRecorder.onstop = this.onMediaRecorderStop.bind(this);
        this.recorderRef.play();
        this.mediaRecorder.start();
    }

    onMediaRecorderDataAvailable(e){this.chunks.push(e.data)}


    onMediaRecorderStop(e){
        const blob = new Blob(this.chunks,{'type':'audio/ogg; codesc=opus'});
        const audioURL = window.URL.createObjectURL(blob);
        this.playerRef.src = audioURL;
        this.chunks = []
        this.stream.getAudioTracks().forEach(track=>track.stop());
        this.stream = null
    }


    //start recording
    startRecording(){
        if(this.isRecording) return
        this.isRecording = true
        this.startRef.innerHTML = "Recording...";
        this.playerRef.src='';
        navigator.mediaDevices.getUserMedia(this.constraints)
        .then(this.handleSuccess.bind(this))
        .catch(this.handleSuccess.bind(this))
    }

    //stop recording

    stopRecording(){
        if(!this.isRecording) return
        this.isRecording = false 
        this.startRef.innerHTML = "Record";
        this.recorderRef.pause();
        this.mediaRecorder.stop();
    }

}

window.VoiceRecorder = new VoiceRecorder();
