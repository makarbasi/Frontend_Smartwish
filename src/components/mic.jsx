import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import './App.css';
import './mic.css';

const MicrophoneReader = () => {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (searchInputRef.current) {
          searchInputRef.current.value = transcript;
        }
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };
    } else {
      console.error("Speech Recognition API not supported");
    }
  }, []);

  const handleMicClick = () => {
    if (recognitionRef.current) {
      if (!listening) {
        recognitionRef.current.start();
        setListening(true);
      } else {
        recognitionRef.current.stop();
        setListening(false);
      }
    }
  };

  return (
    <div className="search-bar">
      
      <input 
        type="text" 
        placeholder="Write the title of the book you are looking for" 
        ref={searchInputRef} 
        id="searchInput" 
      />
      <button className={`mic-button ${listening ? 'mic-active' : ''}`} onClick={handleMicClick}>
        <FontAwesomeIcon icon={faMicrophone}  />
      </button>
       <button className="go-button" id="goButton">GO</button>

    </div>
  );
};

export default MicrophoneReader;
