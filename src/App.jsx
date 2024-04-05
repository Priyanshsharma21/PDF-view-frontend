import axios from 'axios';
import { useState } from 'react';
import { Spin } from 'antd';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Modal } from 'antd';
import {supabase} from './supabase/supabase.js'

const App = () => {
  const [ppt, setPPT] = useState("")
  const [pptFile, setPPTFile] = useState(null)
  const [pdf, setPdf] = useState(null)
  const [loader, setLoader] = useState(false)
  const [open, setOpen] = useState(false);

  const handleCancel = () => {setOpen(false)};

  const handleConvert = async (event) => {
    event.preventDefault()
    setLoader(true)
    try {
      const res= await axios.post('http://localhost:8080/ppt2pdf', { ppt });

      const { data, error } = await supabase
        .from('pdfs')
        .insert([{ pdf: res.data.pdf }])
        .select();
  
      if (error) {
        throw error;
      }
  
      setPdf(res.data.pdf);
      setLoader(false);
      setOpen(true);
    } catch (error) {
        console.log(error)
        setLoader(false)
    }
  };

  const handleChange = (e)=>{
    const { files, name} = e.target

    if(name === "pptFile"){
      const reader = new FileReader();
      reader.readAsDataURL(files[0]);
      reader.onload = (event) => {
        setPPT(event.target.result);
      };
    }
  }

  const newplugin = defaultLayoutPlugin()

  return (
    <div className="w-full min-h-screen h-[100%] home bg-[#282828]">


    <div className="titleOfApp w-full flex justify-center font-semibold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-red-600">
      PDF VUE
    </div>


    <div className="imgBox flex justify-center">
      <img src="https://media1.tenor.com/m/bejjZmPYOY0AAAAd/how-to-toggle-view-in-word-to-show-revisions.gif" alt="pdf home image" className='rounded-xl' />
    </div>


    <form onSubmit={handleConvert} className="uploadBox flex justify-center items-center mt-8">
      <input name="pptFile" className="mt-1 cursor-pointer text-[#bfbfbf]" type="file" onChange={handleChange} />
      <button type='submit' className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg">Generate PDF</button>
    </form>

    {loader ? (
      <div className="w-full flex justify-center mt-5">
        <Spin />
      </div>
    ):(
      <div className="w-full flex justify-center mt-5">
          <Modal
            open={open}
            onCancel={handleCancel}
          >
          <div className="mt-10">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              {pdf ? (
                <Viewer fileUrl={pdf} plugins={[newplugin]}/>
              ):(
                <>No PDF</>
              )}
          </Worker>
          </div>
      </Modal>
      </div>
    )}

  </div>
  )
}

export default App
