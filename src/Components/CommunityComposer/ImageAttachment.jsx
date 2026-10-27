import { useEffect, useState } from "react";
import "./ImageAttachment.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function ImageAttachment({
  attachment,
  onRemove,
  onError,
}) {
  const [previewError, setPreviewError] = useState(false);

  const file = attachment?.file;
  const previewUrl = attachment?.previewUrl;

  const isValidFile =
    file &&
    ALLOWED_IMAGE_TYPES.includes(file.type) &&
    file.size <= MAX_IMAGE_SIZE;

  useEffect(() => {
    setPreviewError(false);
  }, [attachment?.id]);

  if (!attachment || attachment.type !== "image") {
    return null;
  }

  const handleImageLoadError = () => {
    setPreviewError(true);
    onError?.(
      attachment.id,
      "Failed to load image preview. Please select the file again."
    );
  };

  const handleRemove = () => {
    onRemove?.(attachment.id);
  };

  return (
    <article className="image-attachment">
      <div className="image-attachment-header">
        <div className="image-attachment-file-info">
          <span className="image-attachment-icon">
            <i className="fa-regular fa-image" />
          </span>

          <div className="image-attachment-file-details">
            <strong title={file.name}>{file.name}</strong>

            <span>
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>
        </div>

        <button
          type="button"
          className="image-attachment-remove"
          onClick={handleRemove}
          aria-label={`Remove ${file.name}`}
          title="Remove image"
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      <div className="image-attachment-preview">
        {previewError ? (
          <div className="image-attachment-preview-error">
            <i className="fa-solid fa-image" />
            <p>Image preview unavailable</p>

            <button type="button" onClick={handleRemove}>
              Remove image
            </button>
          </div>
        ) : (
          <img
            src={previewUrl}
            alt={`Preview of ${file.name}`}
            onError={handleImageLoadError}
          />
        )}
      </div>
    </article>
  );
}

export default ImageAttachment;