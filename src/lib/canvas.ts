export const getCameraFrame = () => {
  const frame = document.createElement('div');
  frame.classList.add('camera-frame');
  const scanner = document.createElement('div');
  scanner.classList.add('scanner-frame');
  frame.appendChild(scanner);
  return frame;
}

export function cropCanvas(originalCanvas: HTMLCanvasElement, x: number, y: number, width: number, height: number) {
  // Create a new canvas element
  var croppedCanvas = document.createElement('canvas');
  var ctx = croppedCanvas.getContext('2d');

  // Set the dimensions of the new canvas
  croppedCanvas.width = width;
  croppedCanvas.height = height;

  // Draw the cropped portion of the original canvas onto the new canvas
  ctx?.drawImage(originalCanvas, x, y, width, height, 0, 0, width, height);

  // Return the cropped canvas
  return croppedCanvas;
}