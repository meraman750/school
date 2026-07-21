import { useRef, useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';

export default function ImageUpload({ value, onChange, label = 'Upload Image' }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value || null);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      onChange?.(file, reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
          {label}
        </label>
      )}
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="h-20 w-20 rounded-xl object-cover" />
            <button
              type="button"
              onClick={() => { setPreview(null); onChange?.(null, null); }}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
            >
              <FiX className="text-xs" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-primary hover:text-primary"
          >
            <FiUpload />
            <span className="mt-1 text-[10px]">Upload</span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
