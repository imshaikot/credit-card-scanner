import React, { useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { CreditCardScanner } from './lib/video';
import { CreditCardScannerType } from './lib/types';

function App() {
  const ref = useRef<HTMLInputElement>(null);
  const ccScanner = useRef<CreditCardScannerType>();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [isProcessing, isIsProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<Array<any>>([]);


  const triggerPreview = async () => {
    if (ref.current) {
      const cc = new CreditCardScanner();
      ccScanner.current = await cc.initialize();
      ref.current.appendChild(ccScanner.current.getPreviewNode());
      setIsInitialized(true);
    }
  }

  const capture = async () => {
    if (ccScanner.current) ccScanner.current.capture();
    setIsCaptured(true);
  }

  const reset = async () => {
    if (ccScanner.current) ccScanner.current.reset();
    setIsCaptured(false);
  }

  const scan = async () => {
    if (ccScanner.current) {
      isIsProcessing(true);
      const data = await ccScanner.current.start();
      setScannedData(data);
      isIsProcessing(false);
    }
  }


  return (
    <div className="App">
      <div className='preview' ref={ref}>
        <h1>Preview</h1>
      </div>
      {isInitialized ? !isCaptured ? <button onClick={capture}>Capture</button> : (<div className='container'>
        <button onClick={reset}>Reset</button>
        <button onClick={scan}>Scan</button>
        </div>) : 
      <button onClick={triggerPreview}>Initialize</button>}

      {
        scannedData.length && !isProcessing ? (
          <div className='img-container'>
            {scannedData.map(({ name, url, data }) => {
              console.log({ name, data })
              const str = data.text.split('\n').find((t: string) => t.length > 3);
              return str && <div key={name}>
                <img src={url} alt={name} />
                <p><b>{str}</b> (OCR Accuracy: {data.confidence})</p>
              </div>
            })}
          </div>
        ) : isProcessing && <h1>Processing...</h1>
      }
    </div>
  );
}

export default App;
