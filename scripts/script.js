const video = document.getElementById('video');
const musk = new Image;
musk.src = './images/musk.png';

Promise.all([
  faceapi.nets.faceLandmark68TinyNet.loadFromUri('./models'),
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
  .then(stream => video.srcObject = stream)
  .catch(err => console.log(err));
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video,
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks(true);
    const resizeDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizeDetections)
    for (let i = 0; i < resizeDetections.length; i++) {
      const face = resizeDetections[i];
      const left_ear = face.landmarks._positions[1];
      const right_ear = face.landmarks._positions[15];
      const chin = face.landmarks._positions[8];
      const nose = face.landmarks._positions[29];

      const width = Math.sqrt((right_ear._x - left_ear._x) ** 2 + (right_ear._y - left_ear._y) ** 2);
      const height = Math.sqrt((chin._x - nose._x) ** 2 + (chin._y - nose._y) ** 2);
      const angle = Math.asin((right_ear._y - left_ear._y) / width);
      const ctx = canvas.getContext('2d');

      const x = left_ear._x;
      const y = left_ear._y;

      ctx.save();
      ctx.translate(x - 10, y - 10);
      ctx.rotate(angle);
      ctx.translate(-(x - 10), -(y - 10));
      ctx.drawImage(musk, (x - 10), (y - 10), width + 20, height + 20);
      ctx.restore();
    }
  }, 100);
});
