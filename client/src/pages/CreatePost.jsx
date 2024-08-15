import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react";
import { React, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
// import JoditEditor from "jodit-react";
import { useNavigate } from "react-router-dom";
import { app } from "../firebase";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

("react-router-dom");

export default function CreatePost() {
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);

  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageUploadError("Please select an image");
        return;
      }
      setImageUploadError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime + "-" + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError("Upload failed");
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downLoadUrl) => {
            setImageUploadProgress(null);
            setImageUploadError(null);
            setFormData({ ...formData, image: downLoadUrl });
          });
        }
      );
    } catch (error) {
      setImageUploadError("Image upload failed");
      setImageUploadProgress(null);
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/post/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }
      if (data.success === false) {
        setPublishError(data.message);
      }
      if (res.ok) {
        setPublishError(null);
        navigate(`/post/${data.slug}`);
      }
    } catch (error) {
      setPublishError("Something went wrong");
    }
  };

  return (
    <div className=' p-3 max-w-3xl mx-auto min-h-screen'>
      <h1 className=' text-center text-3xl my-7 font-semibold'>
        Create a Post
      </h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div className='flex flex-col gap-4 sm:flex-row justify-between'>
          <TextInput
            type='text'
            placeholder='Title'
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
            }}
            required
            id='title'
          />
          <Select
            onChange={(e) => {
              setFormData({ ...formData, category: e.target.value });
            }}>
            <option value='uncategorized'>Select a category</option>
            <option value='entertainment'>Entertainment</option>
            <option value='politics'>Politics</option>
            <option value='sport'>Sports/Football</option>
            <option value='Education'>Education</option>
          </Select>
        </div>
        <div
          className='flex gap-4 items-center justify-between
        border-4 border-gray-400 border-dotted p-3'>
          <FileInput
            type='file'
            accept='image/*'
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button
            type='button'
            className='bg-black-border btn-long
            btn-rounded hover:text-white font-semibold text-sm
            text-black
          '
            size='sm'
            onClick={handleUploadImage}
            outline
            disabled={imageUploadProgress}>
            {imageUploadProgress ? (
              <div className='w-16 h-16'>
                <CircularProgressbar
                  styles={buildStyles({
                    pathColor: "#12a32d",
                    trailColor: "#fff",
                    textColor: "#fff",
                    backgroundColor: "green",
                  })}
                  value={imageUploadProgress}
                  text={`${imageUploadProgress || 0}%`}
                />
              </div>
            ) : (
              "Upload image"
            )}
          </button>
        </div>
        {imageUploadError && (
          <Alert color={"failure"}>{imageUploadError}</Alert>
        )}
        {formData.image && (
          <img
            src={formData.image}
            alt='upload'
            className='h-72 mb-12'
            required
          />
        )}
        <ReactQuill
          theme='snow'
          placeholder='Write something...'
          className=' h-72 mb-12'
          onChange={(value) => {
            setFormData({ ...formData, content: value });
          }}
          required
        />
        {/* <JoditEditor
          onChange={(value) => {
            setFormData({ ...formData, content: value });
          }}
        /> */}
        <button
          className='btn btn-long btn-rounded'
          type='submit'
          gradientDuoTone='greenToBlue'>
          Publish
        </button>
        {publishError && <Alert color='failure'> {publishError} </Alert>}
      </form>
    </div>
  );
}
