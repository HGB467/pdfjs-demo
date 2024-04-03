import logo from './logo.svg';
import './App.css';
import { useEffect, useRef,useState } from 'react'

function App() {

  const canvasRef = useRef()
  const pdfjs = useRef()
  const pdfjsWorker = useRef()
  const pdf = useRef()
  const pageNumber = useRef(1)
  const canv = useRef()
  const videoRef = useRef()

  async function importItems() {
    pdfjs.current = await import('../node_modules/pdfjs-dist/build/pdf.min.mjs');
    pdfjsWorker.current = await import('../node_modules/pdfjs-dist/build/pdf.worker.min.mjs');

    pdfjs.current.GlobalWorkerOptions.workerSrc = pdfjsWorker.current;

  }

  async function loadPDF() {
    const pdfPath = '/sample.pdf'
    const loadingTask = pdfjs.current.getDocument(pdfPath);
    pdf.current = await loadingTask.promise;
    console.log('PDF loaded');

    // Fetch the first page
    pdf.current.getPage(pageNumber.current).then(function (page) {
      console.log('Page loaded');

      const scale = 1.5;
      const viewport = page.getViewport({ scale: scale });

      // Prepare canvas using PDF page dimensions
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      const renderTask = page.render(renderContext);
      renderTask.promise.then(async function () {
        console.log('Page rendered');
        captureStream()

      });
    });
  }

  async function toNextPage(){
    pdf.current.getPage(++pageNumber.current).then(function (page) {
      console.log('Page loaded');

      const scale = 1.5;
      const viewport = page.getViewport({ scale: scale });

      // Prepare canvas using PDF page dimensions
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      const renderTask = page.render(renderContext);
      renderTask.promise.then(async function () {
        console.log('Page rendered');
        // captureStream()
      });
    });
  }

  useEffect(() => {
    importItems().then(async () => {
      await loadPDF()
    })
  }, [])



  function captureStream(){
    // const data = canvasRef.current.toDataURL()
    // console.log(data,'data')
    // const image = new Image();
    // image.src = data
    // image.onload = () =>{
    //   const ctx = canv.current.getContext("2d");
    //   ctx.drawImage(image, 0, 0,canv.current.width,canv.current.height);
    // }

    const stream = canvasRef.current.captureStream();
    videoRef.current.srcObject = stream;
    console.log('stream captured')


  }



  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", minHeight: "100vh",gap:"5rem" }}>
      <div style={{display:"flex",flexDirection:"column",gap:'1rem',alignItems:'center',justifyContent:"center"}}>
        <h1>Local</h1>
      <canvas style={{ maxHeight: "70vh" }} ref={canvasRef}></canvas>
      <button onClick={toNextPage}>Next</button>
      </div>
      
    <div style={{display:"flex",flexDirection:"column",gap:'1rem',alignItems:'center',justifyContent:"center"}}>
    <h1>Remote</h1>
    {/* <canvas ref={canv} style={{ maxHeight: "70vh" }} width={540} height={720}></canvas> */}
    <video controls autoPlay ref={videoRef} width={640} height={480}></video>
    </div>


    </div>
  );
}

export default App;
