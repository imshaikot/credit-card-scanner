
  function applyEdgeDetection(canvas: HTMLCanvasElement) {
    // Convert the source image to grayscale
    const srcMat = cv.imread(canvas) //cv.matFromImageData(srcImageData);
    const grayMat = new cv.Mat();
    cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY, 0);

    // Apply Canny edge detection
    const edgesMat = new cv.Mat();
    cv.Canny(srcMat, edgesMat, 60, 100, 3, true); // Adjust these parameters as needed
    cv.imshow(canvas, edgesMat);
    
    // Free memory
    srcMat.delete();
    grayMat.delete();
    edgesMat.delete();

    // Return the data URL of the canvas
    return canvas.toDataURL();
}

const applyThreshold = (imgData: string, threshold: number): Promise<string> => {
    return new Promise(resolve => {
        const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
    
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;
    
        // Draw the image onto the canvas
        ctx?.drawImage(img, 0, 0);
    
        // Get the image data from the canvas
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height) as any;
        const data = imageData?.data as any;
    
        // Apply threshold filter
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const newValue = brightness < threshold ? 0 : 255;
            data[i] = newValue;         // Red
            data[i + 1] = newValue;     // Green
            data[i + 2] = newValue;     // Blue
        }
    
        // Put the modified image data back onto the canvas
        ctx?.putImageData(imageData, 0, 0);
    
        // Convert canvas to base64 data URL
        const filteredImg = canvas.toDataURL();
    
        resolve(filteredImg);
    }
    img.src = imgData;
    })
};

function matToImageData(mat: any) {
    const c = document.createElement('canvas');
    c.width = mat.cols;
    c.height = mat.rows;
   cv.imshow(c, mat)
    return c.toDataURL();
}

export async function enhanceImageWithOpenCV(canvas: HTMLCanvasElement) {
    const srcMat = cv.imread(canvas);

    // // Contrast adjustment
    const dstContrast = new cv.Mat();
    const alpha = 2.0; // Contrast control (1.0-3.0)
    const beta = 0;    // Brightness control (0-100)
    cv.convertScaleAbs(srcMat, dstContrast, alpha, beta);

    // Histogram equalization
    const dstEqualized = new cv.Mat();
    cv.cvtColor(srcMat, srcMat, cv.COLOR_RGBA2GRAY, 0);
    cv.equalizeHist(srcMat, dstEqualized);


    // Noise reduction using Gaussian blur
    const dstBlurred = new cv.Mat();
    cv.GaussianBlur(srcMat, dstBlurred, new cv.Size(3, 3), 0, 0, cv.BORDER_DEFAULT);

    // Binarization using adaptive thresholding
    const dstThresholded = new cv.Mat();
    cv.adaptiveThreshold(srcMat, dstThresholded, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 11, 2);

    // Convert enhanced images to ImageData
    const enhancedImages = {
        cannyEdge: applyEdgeDetection(canvas),
        contrast: matToImageData(dstContrast),
        equalized: matToImageData(dstEqualized),
        blurred: matToImageData(dstBlurred),
        adaptiveThreshold96: await applyThreshold(canvas.toDataURL(), 96),
        adaptiveThreshold128: await applyThreshold(canvas.toDataURL(), 128),
        thresholded: matToImageData(dstThresholded)
    };

    // // Clean up
    srcMat.delete();
    dstContrast.delete();
    dstEqualized.delete();
    dstBlurred.delete();
    dstThresholded.delete();

    return enhancedImages;
}