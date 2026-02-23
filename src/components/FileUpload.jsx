import { useRef, useState } from 'react';

export default function FileUpload({
  label = '',
  onFileSelect,
  acceptedFormats = ['*'],
  maxSize = 5242880, // 5MB default
  multiple = false,
  error = '',
  className = '',
}) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    let validFiles = [];

    fileArray.forEach((file) => {
      if (file.size > maxSize) {
        console.warn(`File ${file.name} exceeds max size`);
        return;
      }

      if (
        acceptedFormats[0] !== '*' &&
        !acceptedFormats.includes(file.type)
      ) {
        console.warn(`File ${file.name} format not accepted`);
        return;
      }

      validFiles.push(file);
    });

    setSelectedFiles(validFiles);
    onFileSelect?.(validFiles);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="font-heading text-[0.8rem] font-semibold text-[var(--text-primary)] tracking-[0.02em]">
          {label}
        </label>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center
          transition-all duration-200 cursor-pointer
          ${
            dragActive
              ? 'border-[var(--accent)] bg-[var(--bg-hover)]'
              : 'border-[var(--border-light)]'
          }
          ${error ? 'border-[#EF4444]' : ''}
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          accept={acceptedFormats.join(',')}
          className="hidden"
        />

        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="mx-auto mb-3 text-[var(--text-muted)]"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>

        <p className="font-heading text-[0.95rem] font-semibold text-[var(--text-primary)] mb-1">
          Drag and drop files here
        </p>
        <p className="font-body text-[0.8rem] text-[var(--text-muted)]">
          or click to select files
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-3 space-y-2">
          {selectedFiles.map((file) => (
            <div
              key={file.name}
              className="flex items-center gap-2 p-2 bg-[var(--bg-hover)] rounded-lg"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[var(--accent)]"
              >
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              <span className="font-body text-[0.85rem] text-[var(--text-primary)] flex-1">
                {file.name}
              </span>
              <span className="font-body text-[0.75rem] text-[var(--text-muted)]">
                {(file.size / 1024).toFixed(2)} KB
              </span>
            </div>
          ))}
        </div>
      )}

      {error && <span className="font-body text-[0.75rem] text-[#EF4444]">{error}</span>}
    </div>
  );
}
