<template>
  <q-page id="main-page" class="container" style="background-color: rgb(20, 20, 20);">
        <div id="playBtn">
            <img id="record" class="record mbtn" src="../assets/record.svg">
            <img id="note" class="mnote mbtn" src="../assets/eighth-note.png">
            <img id="play" class="mnote mbtn" style="margin-left: 5px;" src="../assets/play.png">
        </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PageIndex',
  setup() {
  },
  mounted() {
    var playBtn = document.getElementById('playBtn');
    var audioBuffer, analyzer, frequency, soundsrc, isPlaying = false;
    var i = 0;
    var max = 255;
    var rot = 0;
    var color = 'rgb(' + Math.floor(Math.random() * max) + ', ' + Math.floor(Math.random() * max) + ', ' + Math.floor(Math.random() * max) + ')';
    function init() {
        var context = getAudioContext();
        document.getElementById("note").style.display = "none";
        if (context) {
            loadSound(context, 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/481938/Scarlet_Fire.mp3');
            d3.select('#main-page')
                .append('svg')
                .attr('width', '100%')
                .attr('height', '100%')
                .append('defs');

            var radial = d3.select('defs').append('radialGradient')
                .attr('id', 'gradient')
                .attr('cx', '50%')
                .attr('cy', '50%')
                .attr('r', '50%')
                .attr('fx', '50%')
                .attr('fy', '50%');

            radial.append('stop')
                .attr('offset', '80%')
                .style('stop-color', 'rgb(0,0,0)')
                .style('stop-opacity', 0);
            radial.append('stop')
                .attr('offset', '90%')
                .attr('id', 'colored')
                .style('stop-color', '#00bfff')
                .style('stop-opacity', 1);
            radial.append('stop')
                .attr('offset', '100%')
                .style('stop-color', 'rgb(0,0,0)')
                .style('stop-opacity', 0);
            $('.mbtn').mouseover(function() {
                $('.mbtn').css('opacity', '0.2');
            });

            $('.mbtn').mouseout(function() {
                $('.mbtn').css('opacity', '1');
            });
            
        } else {
            alert('Audio API not supported in current browser.');
        }
    }

    function getAudioContext() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        if (window.AudioContext) {
        return new AudioContext();
        }
        return null;
    }

    function loadSound(context, url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
            playBtn.onclick = function(e) {
                if(!isPlaying){
                    playSound(context, buffer);
                    document.getElementById("note").style.display = "block";
                    document.getElementById("play").style.display = "none";
                } else {
                    stopSound();
                    document.getElementById("note").style.display = "none";
                    document.getElementById("play").style.display = "block";
                }
            }
        }, onLoadSoundError);
        }
        request.send();
    }

    function onLoadSoundError(e) {
        alert('Sound file could not be loaded.');
    }

    function playSound(context, buffer) {
        if (!isPlaying) {
            playBtn.className = 'stop';
            isPlaying = true;
            //playBtn.style.display = 'none';
            soundsrc = context.createBufferSource();
            analyzer = context.createAnalyser();
            frequency = new Uint8Array(analyzer.frequencyBinCount);

            soundsrc.buffer = buffer;
            soundsrc.connect(context.destination);
            soundsrc.connect(analyzer);
            soundsrc.addEventListener('ended', function(){
                stopSound();
            });
            soundsrc.start(0);
            render();
        }
    }
    
    function stopSound(){
        soundsrc.stop();
        isPlaying = false;
        playBtn.className = '';
    }

    function render() {
        if (i % 20 == 0) {
            color = 'rgb(' + Math.floor(Math.random() * max) + ', ' + Math.floor(Math.random() * max) + ', ' + Math.floor(Math.random() * max) + ')';
        }
        d3.select('.record').style('transform', 'translate(-50%, -50%) rotate(' + rot + 'deg)');
        requestAnimationFrame(render);
        analyzer.getByteFrequencyData(frequency);
        d3.select('#colored').style('stop-color', color);

        d3.select('svg').selectAll('circle')
        .data(frequency.slice(0, 10))
        .attr('r', function(d) {
            return ((d / 255) * 25) + '%';
        })
        .enter().append('circle')
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('fill', 'url(#gradient)');
        i++;
        if (isPlaying) {
            rot+=2;
        }

    }
    init()
}
})
</script>
<style>
    .record {
        position: absolute;
        max-width: 250px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
        cursor: pointer;
    }

    .mnote {
        position: absolute;
        max-width: 45px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
        cursor: pointer;
    }

    #main-page svg {
        position: absolute;
        z-index: 0;
        max-width: 500px;
        left: 50%;
        transform: translateX(-50%);
    }
</style>