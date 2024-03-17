import './preview.css';
import { createWorker, createScheduler, Scheduler } from 'tesseract.js';
import { getCameraFrame, cropCanvas } from './canvas';
import { CreditCardScannerType } from './types';
import { enhanceImageWithOpenCV } from './computer-vision';


export class CreditCardScanner {
    private previewNode: HTMLDivElement = document.createElement('div');
    private videoNode: HTMLVideoElement = document.createElement('video');

    private scheduler: Scheduler = createScheduler();

    constructor() {}

    private async attachMedia() {
        const stream =  await navigator.mediaDevices.getUserMedia({ video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }, 
        });
        this.videoNode.srcObject = stream;
    }

    private getCanvas(): Promise<HTMLCanvasElement> {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 360;
            
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(this.videoNode, 0, 0, 640, 360);
                resolve(cropCanvas(canvas, 98, 40, 446, 282))
            }
        });
    }

    private async doOCR(imgData: string) {
        const { data } = await this.scheduler.addJob('recognize', imgData);
        return data;
    }

    private async createWorker() {
        const maxNumberOfWorker = 10;
        for (let i = 0; maxNumberOfWorker > i; i++) {
            const worker = await createWorker('eng');
            await worker.setParameters({
                tessedit_char_whitelist: '0123456789',
              });
            this.scheduler.addWorker(worker);
        }
    }

    public async initialize() {
        await this.attachMedia();
        this.previewNode.classList.add('tooltip');
        this.previewNode.classList.add('bottom');
        this.previewNode.appendChild(this.videoNode);
        this.videoNode.play();
        return new Promise<CreditCardScannerType>((resolve) => {
            const cb = () => {
                resolve({
                    getPreviewNode: () => {
                       this.previewNode.appendChild(getCameraFrame());
                       return this.previewNode;
                    },
                    start: async () => {
                        await this.createWorker();
                        const originalCanvas = await this.getCanvas();
                        const originalImage = originalCanvas.toDataURL()
                        const cvEnhancedImgs = await enhanceImageWithOpenCV(originalCanvas);
                        const ocrs = [
                            await this.doOCR(originalImage),
                            await this.doOCR(cvEnhancedImgs.adaptiveThreshold96),
                            await this.doOCR(cvEnhancedImgs.adaptiveThreshold128),
                            await this.doOCR(cvEnhancedImgs.thresholded),
                            await this.doOCR(cvEnhancedImgs.cannyEdge),
                            await this.doOCR(cvEnhancedImgs.blurred),
                            await this.doOCR(cvEnhancedImgs.contrast),
                            await this.doOCR(cvEnhancedImgs.equalized),
                        ]
                        return [
                            {
                                name: 'original',
                                url: originalImage,
                                data: ocrs[0],
                            },
                            {
                                name: 'adaptiveThreshold96',
                                url: cvEnhancedImgs.adaptiveThreshold96,
                                data: ocrs[1],
                            },
                            {
                                name: 'adaptiveThreshold128',
                                url: cvEnhancedImgs.adaptiveThreshold128,
                                data: ocrs[2],
                            },
                            {
                                name: 'thresholded',
                                url: cvEnhancedImgs.thresholded,
                                data: ocrs[3],
                            },
                            {
                                name: 'cannyEdge',
                                url: cvEnhancedImgs.cannyEdge,
                                data: ocrs[4],
                            },
                            {
                                name: 'blurred',
                                url: cvEnhancedImgs.blurred,
                                data: ocrs[5],
                            },
                            {
                                name: 'contrast',
                                url: cvEnhancedImgs.contrast,
                                data: ocrs[6],
                            },
                            {
                                name: 'equalized',
                                url: cvEnhancedImgs.equalized,
                                data: ocrs[7],
                            },
                        ]
                    },
                    capture: () => {
                        this.videoNode.pause();
                    },
                    reset: () => {
                        this.videoNode.play();
                    }
                });
                this.videoNode.removeEventListener('play', cb);
            }
            this.videoNode.addEventListener('play', cb);
        })
    }

}