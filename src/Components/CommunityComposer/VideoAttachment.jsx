

import { useEffect, useState } from "react";
import "./VideoAttachment.css";

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_VIDEO_DURATION = 5 * 60; // 5 minutes

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

function VideoAttachment({
  attachment,
  onRemove,
  onError,
}) {
  const [previewError, setPreviewError] = useState(false);
  const [durationError, setDurationError] = useState("");
  const [videoDuration, setVideoDuration] = useState(null);

  const file = attachment?.file;
  const previewUrl = attachment?.previewUrl;

  const isValidFile =
    file &&
    ALLOWED_VIDEO_TYPES.includes(file.type) &&
    file.size <= MAX_VIDEO_SIZE;

  useEffect(() => {
    setPreviewError(false);
    setDurationError("");
    setVideoDuration(null);
  }, [attachment?.id]);

  if (!attachment || attachment.type !== "video") {
    return null;
  }

  const formatDuration = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "Unknown duration";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const handleMetadataLoaded = (event) => {
    const duration = event.currentTarget.duration;

    if (!Number.isFinite(duration) || duration <= 0) {
      setDurationError("Failed to read video duration.");
      onError?.(
        attachment.id,
        "Failed to read video duration."
      );
      return;
    }

    setVideoDuration(duration);

    if (duration > MAX_VIDEO_DURATION) {
      const message = "Video duration cannot exceed 5 minutes.";

      setDurationError(message);
      onError?.(attachment.id, message);
      return;
    } 

    setDurationError("");
  };

  const handleVideoError = () => {
    setPreviewError(true);

    const message =
      "Failed to load video preview. Please check the file format.";

    onError?.(attachment.id, message);
  };

  const handleRemove = () => {
    onRemove?.(attachment.id);
  };

  let validationMessage = "";

  if (!file) {
    validationMessage = "Video file is not available.";
  } else if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    validationMessage = "Only MP4, WebM, and MOV videos are supported.";
  } else if (file.size > MAX_VIDEO_SIZE) {
    validationMessage = "Video size must not exceed 50 MB.";
  }

  const hasError = Boolean(
    validationMessage || durationError || previewError
  );

  return (
    <article
      className={`video-attachment ${
        hasError ? "video-attachment-has-error" : ""
      }`}
    >
      <div className="video-attachment-header">
        <div className="video-attachment-file-info">
          <span className="video-attachment-icon">
            <i className="fa-solid fa-video" />
          </span>

          <div className="video-attachment-file-details">
            <strong title={file?.name}>
              {file?.name || "Video attachment"}
            </strong>

            <span>
              {file
                ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                : "File unavailable"}

              {videoDuration !== null &&
                ` · ${formatDuration(videoDuration)}`}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="video-attachment-remove"
          onClick={handleRemove}
          aria-label={`Remove ${file?.name || "video"}`}
          title="Remove video"
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      {validationMessage ? (
        <div className="video-attachment-error" role="alert">
          <i className="fa-solid fa-triangle-exclamation" />
          <p>{validationMessage}</p>
        </div>
      ) : previewError ? (
        <div className="video-attachment-error" role="alert">
          <i className="fa-solid fa-circle-exclamation" />
          <p>Video preview unavailable. Please remove and select the file again.</p>
        </div>
      ) : (
        <div className="video-attachment-preview">
          <video
            src={previewUrl}
            controls
            preload="metadata"
            playsInline
            onLoadedMetadata={handleMetadataLoaded}
            onError={handleVideoError}
          >
            Your browser does not support HTML video.
          </video>
        </div>
      )}

      {durationError && !previewError && !validationMessage && (
        <div className="video-attachment-duration-error" role="alert">
          <i className="fa-solid fa-triangle-exclamation" />
          <p>{durationError}</p>
        </div>
      )}
    </article>
  );
}

export default VideoAttachment;