import React, { useRef, useState } from 'react';
import { PaymentIcon } from 'react-svg-credit-card-payment-icons';
import creditcardType from 'credit-card-type';
import './App.css';
import { CreditCardScanner } from './lib/video';
import { CreditCardScannerType } from './lib/types';

function toName(cc: any) {
  if (!cc) return 'generic'
  console.log(cc)
  return cc.type;
}

function App() {
  const ref = useRef<HTMLInputElement>(null);
  const ccScanner = useRef<CreditCardScannerType>();
  const fileInput = useRef<HTMLInputElement>(null);
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

  const selectImageFile = () => {
    if (fileInput.current) {
      fileInput.current.click();
    }
  }

  const processImageFile = async () => {
    const cc = new CreditCardScanner();
    if (ref.current && fileInput.current && fileInput.current.files) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          const img = new Image();
          img.src = e.target?.result as string;
          setIsInitialized(true);

          ccScanner.current = await cc.initialize(img);
          ref.current?.appendChild(ccScanner.current.getPreviewNode());
          setIsCaptured(true);
        }
      }
      reader.readAsDataURL(fileInput.current.files[0]);
    }
  }

  const capture = async () => {
    if (ccScanner.current) ccScanner.current.capture();
    setIsCaptured(true);
  }

  const reset = async () => {
    if (ccScanner.current) ccScanner.current.reset();
    setIsCaptured(false);
    setIsInitialized(false);
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
      Either use your camera to capture a credit-card image OR select a image file to scan the card. 
      Don't worry, everything happens on your own browser and no servers are involved between you and the scanner. 
      <input onChange={processImageFile} ref={fileInput} type='file' accept='image/*' style={{ visibility: 'hidden', width: '1px' }} />
      <div className='preview' ref={ref}>
        <h1>Preview</h1>
      </div>
      {isInitialized ? !isCaptured ? <button className='button-secondary' onClick={capture}>Capture</button> : (<div className='container'>
        <button className='button-primary' onClick={reset}>Reset</button>
        <button className='button-secondary' onClick={scan}>Scan</button>
        </div>) : 
      <div className='button-group'>
      <button className='button-secondary' onClick={triggerPreview}>
        Open Camera
      </button>
      <button className='button-primary' onClick={selectImageFile}>Select a file</button>
      </div>}

      {
        scannedData.length && !isProcessing ? (
          <div className='img-container'>
            {scannedData.map(({ name, url, data }) => {
              const str = data.text.split('\n').find((t: string) => t.length > 2);
              return str && <div key={name}>
                <img src={url} alt={name} />
                <div style={{ 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  display: 'flex',
                  gap: '10px' 
                  }}>
                  <PaymentIcon type={toName(creditcardType(str)[0])} />
                  <b>{str}</b> (OCR Accuracy: {data.confidence})
                </div>
              </div>
            })}
          </div>
        ) : isProcessing && <h1>Processing...</h1>
      }
    </div>
  );
}

export default App;
