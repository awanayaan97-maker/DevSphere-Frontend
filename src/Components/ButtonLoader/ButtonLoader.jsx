

import "./ButtonLoader.css";

function ButtonLoader({
  children,
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  loadingText = "Please wait...",
  onClick,
}) {
  return (
    <button
      type={type}
      className={`button-loader ${className}`}
      disabled={loading || disabled}
      onClick={onClick}
      aria-busy={loading}
    >
      {loading && (
        <span className="button-loader-spinner" aria-hidden="true" />
      )}

      <span className="button-loader-text">
        {loading ? loadingText : children}
      </span>
    </button>
  );
}

export default ButtonLoader;