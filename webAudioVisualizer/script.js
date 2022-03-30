"use strict";
// globals
var WIDTH = 400;
var HEIGHT = 200;
var analyser = null;
var dataArray = null;
var canvasCtx = null;
var canvas = null;
var cx = 0;
var cy = 50;
var bufferLength = -1;
var clickListener = document.body.addEventListener("click",start);

function start() {
    document.body.removeEventListener("click", clickListener);
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
    // removed webkitAudioContext()
    var audioCtx = new window.AudioContext(); // represents audio-processing graph
    analyser = audioCtx.createAnalyser();
    analyser.smoothingTimeConstant = 1;
    analyser.maxDecibels = 0;
    var constraints = {
        audio: true,
        video: false
    }

    var myAudio = document.getElementById("audio");
    //myAudio.crossOrigin = "anonymous";
    myAudio.setAttribute("crossOrigin","anonymous");
    var source = audioCtx.createMediaElementSource(myAudio);
    
    
    source.connect(analyser);
    source.connect(audioCtx.destination);
    // set up buffer
    analyser.fftSize = 8192;
    bufferLength = analyser.frequencyBinCount*2;
    dataArray = new Uint8Array(bufferLength);
    // clear canvas
    canvas = document.getElementById("ctx");
    canvasCtx = canvas.getContext("2d");
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    draw();

    /*
    var stream = null;
    //https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API
    var source = navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            // use the stream

            var source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            //analyser.connect(distortion);
            //distortion.connect(audioCtx.destination);

            // set up buffer
            analyser.fftSize = 8192;
            bufferLength = analyser.frequencyBinCount*2;
            dataArray = new Uint8Array(bufferLength);
            // clear canvas
            canvas = document.getElementById("ctx");
            canvasCtx = canvas.getContext("2d");
            canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
            draw();
        })
        .catch(function(err) {
            // handle the error
            console.log("bug: getUserMedia() could not resolve promise")
        });
        */

    
}

function draw() {
    var drawVisual = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);
    //canvasCtx.fillStyle = 'rgb(200,200,200)';
    let r = dataArray[0];
    let g = dataArray[255];
    let b = dataArray[511];
    canvasCtx.fillStyle = `rgb(${r*1.2},${g*1.5},${b*1.2})`; //bg
    canvasCtx.fillRect(0,0,WIDTH,HEIGHT);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0,0,0)';
    //canvasCtx.strokeStyle = `rgb(${b*1.5},${r*1.5},${g*1.5})`; //fg
    canvasCtx.beginPath();
    var sliceWidth = WIDTH * 1.0 / bufferLength;
    var x = 0;
    for (var i = 0; i < bufferLength; i++) {
        var v = dataArray[i] / 128.0;
        var y = v * HEIGHT*.4;
        if (i === 0) {
            canvasCtx.moveTo(x,y);
        } else {
            canvasCtx.lineTo(x,y);
        }
        x += sliceWidth;
    }
    canvasCtx.lineTo(canvas.width, canvas.height);
    canvasCtx.stroke();
    
    // move canvas
    if (++cx > document.body.clientWidth)
        cx = 0;
    canvas.setAttribute("style",`left: ${++cx}px`);
}