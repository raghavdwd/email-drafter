import React, { useState, useEffect, useCallback } from "react";
import { previewEmail } from "../utils/emailApi";
import { convertLink } from "../utils/convertLink";

const EmailPreviewModal = ({
  isOpen,
  onClose,
  fileId,
  templateId,
  rowCount,
}) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(1);
  const [error, setError] = useState("");

  const processBodyWithImages = (body, images) => {
    if (!images || images.length === 0) return body;

    let processedBody = body;
    images.forEach((imageInfo) => {
      const imgTag = `<div style="margin: 20px 0;"><img src="${convertLink(
        imageInfo.url
      )}" alt="${
        imageInfo.variableName
      }" style="max-width: 100%; height: auto; display: block; border: 1px solid #ddd; border-radius: 4px;"></div>`;
      processedBody = processedBody.replace(
        `__IMAGE_PLACEHOLDER_${imageInfo.imageId}__`,
        imgTag
      );
    });

    return processedBody;
  };

  const fetchPreview = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await previewEmail(fileId, templateId, selectedRow);
      setPreview(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load preview");
    } finally {
      setLoading(false);
    }
  }, [fileId, templateId, selectedRow]);

  useEffect(() => {
    if (isOpen && fileId && templateId) {
      fetchPreview();
    }
  }, [isOpen, fileId, templateId, fetchPreview]);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </button>

        <h3 className="font-bold text-lg mb-4">Email Preview</h3>

        {/* Row Selector */}
        <div className="flex items-center gap-4 mb-6">
          <label className="label">
            <span className="label-text font-medium">Preview Row:</span>
          </label>
          <div className="join">
            <button
              className="join-item btn btn-sm"
              onClick={() => setSelectedRow(Math.max(1, selectedRow - 1))}
              disabled={selectedRow <= 1}
            >
              «
            </button>
            <input
              type="number"
              className="join-item btn btn-sm w-20 text-center"
              value={selectedRow}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setSelectedRow(Math.max(1, Math.min(rowCount, val)));
              }}
              min={1}
              max={rowCount}
            />
            <button
              className="join-item btn btn-sm"
              onClick={() =>
                setSelectedRow(Math.min(rowCount, selectedRow + 1))
              }
              disabled={selectedRow >= rowCount}
            >
              »
            </button>
          </div>
          <span className="text-sm text-base-content/60">
            of {rowCount} rows
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        ) : preview ? (
          <div className="space-y-6">
            {/* Subject */}
            <div className="bg-base-200 rounded-lg p-4">
              <div className="text-sm text-base-content/60 mb-1">Subject:</div>
              <div className="font-semibold text-lg">{preview.subject}</div>
            </div>

            {/* Body */}
            <div className="bg-base-200 rounded-lg p-4">
              <div className="text-sm text-base-content/60 mb-2">
                Email Body:
              </div>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: processBodyWithImages(preview.body, preview.images),
                }}
              />
            </div>

            {/* Recipient */}
            {preview.recipientEmail && (
              <div className="text-sm text-base-content/60">
                <span className="font-medium">To:</span>{" "}
                {preview.recipientEmail}
              </div>
            )}
          </div>
        ) : null}

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default EmailPreviewModal;
