// 

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css"; // Assuming you have this CSS file
import RichTextEditor from './RichTextEditor';

function App() {
  const [file, setFile] = useState(null);
  const [previewContent, setPreviewContent] = useState("");
  const [editorContent, setEditorContent] = useState(""); // Content from Jodit editor
  const [openEditor, setOpenEditor] = useState(false); // Corrected state variable name
  const previewRef = useRef(null); // Reference to the main preview container
  const editorContentRef = useRef(null); // Reference for the editor's content div
  const pandocContentRef = useRef(null); // Reference for the Pandoc's content div

  // Effect for handling text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !previewRef.current) {
        return; // No selection or selection not within the main preview
      }

      const range = selection.getRangeAt(0);

      // Check if the selection is within the editor's content div
      if (editorContentRef.current && editorContentRef.current.contains(range.commonAncestorContainer)) {
        console.log("Selected portion is from Editor Content!");
        alert("Selected portion is from Editor Content!");
        setOpenEditor(true)
      }
      // Check if the selection is within the Pandoc's content div
      else if (pandocContentRef.current && pandocContentRef.current.contains(range.commonAncestorContainer)) {
        console.log("Selected portion is from Pandoc (Preview) Content!");
        alert("Selected portion is from Pandoc (Preview) Content!");

        // --- NEW: Get the parent tag for the selected portion within Pandoc content ---
        let selectedNode = range.commonAncestorContainer;
        let parentElement = selectedNode.nodeType === Node.ELEMENT_NODE ? selectedNode : selectedNode.parentElement;

        // Ensure we're within the pandocContentRef div, but not necessarily that div itself
        while (parentElement && parentElement !== pandocContentRef.current) {
          // Check if the parent is an element node (e.g., <p>, <h1>, <span>)
          if (parentElement.nodeType === Node.ELEMENT_NODE) {
            console.log("Closest parent tag for Pandoc selection:", parentElement.tagName);
            // If you want the actual HTML element:
            // console.log("Parent Element:", parentElement);
            alert(`Closest parent tag for Pandoc selection: <${parentElement.tagName}>`);
            break; // Found the closest parent element, stop
          }
          parentElement = parentElement.parentElement; // Move up to the next parent
        }
        // --- END NEW ---
      }
      // If the selection spans across both or outside, you might need more complex logic
      else if (previewRef.current.contains(range.commonAncestorContainer)) {
        // This case handles selections within the overall preview, but not specifically in one of the wrapped divs
        // (e.g., if you had text directly in previewContent's outer div that wasn't wrapped, or a selection spanning both)
        console.log("Selected portion is within the combined Preview Area (could be mixed or unclassified).");
        alert("Selected portion is within the combined Preview Area (could be mixed or unclassified).");
      }
    };

    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("keyup", handleSelection);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("keyup", handleSelection);
    };
  }, []); // Empty dependency array means this runs once on mount

  // Handler for file input change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handler for uploading the file to the server
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setPreviewContent("Loading and converting document..."); // Provide immediate feedback
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setPreviewContent(res.data.content);

      // Crucial: After new content is loaded, tell MathJax to process it
      // Pass both content refs if MathJax needs to process elements within both divs
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([editorContentRef.current, pandocContentRef.current])
          .then(() => {
            console.log("MathJax typeset complete for all content!");
          })
          .catch(err => {
            console.error("MathJax typesetting error:", err);
          });
      } else {
        console.warn("MathJax object not available for typesetting. Ensure it's loaded in index.html.");
      }

    } catch (err) {
      console.error("Error uploading file or processing conversion", err.response ? err.response.data : err.message);
      setPreviewContent(`<p style="color: red;">Error: ${err.response ? err.response.data.error : err.message}</p>`);
    }
  };
  console.log("previewContent", previewContent)
  return (
    <div style={{ padding: 20 }}>
      {/* --- NEW/UPDATED: CSS for responsive images and other elements --- */}
      <style>
        {`
        .mathjax-preview {
            width: 100%;
            border: 1px solid #ccc;
            padding: 15px;
            min-height: 200px;
            background-color: #f9f9f9;
            overflow-x: auto;
            box-sizing: border-box;
        }

        .mathjax-preview img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
            border: 1px solid #eee;
            box-sizing: border-box;
        }

        .mathjax-preview table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin-bottom: 1em;
            overflow-x: auto;
            display: block;
            box-sizing: border-box;
        }

        .mathjax-preview th,
        .mathjax-preview td {
            padding: 8px;
            border: 1px solid #ddd;
            text-align: left;
            word-wrap: break-word;
            overflow-wrap: break-word;
            box-sizing: border-box;
        }

        .mathjax-preview pre,
        .mathjax-preview code {
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-x: auto;
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            display: block;
            box-sizing: border-box;
        }

        .mathjax-preview p,
        .mathjax-preview h1,
        .mathjax-preview h2,
        .mathjax-preview h3,
        .mathjax-preview h4,
        .mathjax-preview h5,
        .mathjax-preview h6,
        .mathjax-preview li {
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .mjx-chtml {
            word-wrap: normal;
            overflow-x: auto;
            display: block;
        }
        `}
      </style>

      <h2>DOCX to HTML with MathML Preview</h2>
      <input type="file" accept=".docx" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file}>Upload & Preview</button>

      <div style={{ marginTop: 30 }}>
        <div>
          {openEditor && (
            <div className="h-full overflow-auto flex flex-col w-full">
              <RichTextEditor initialValue={editorContent} onChange={setEditorContent} />
              <button onClick={() => setOpenEditor(false)} className="p-2 w-fit border-2 rounded shadow">
                Save Text
              </button>
            </div>
          )}
          <button className="p-2 w-fit border-2 rounded shadow" onClick={() => setOpenEditor(true)}>
            Insert/Edit Text
          </button>
        </div>

        <h3>Combined Preview</h3>
        <div
          ref={previewRef} // This ref is for the *entire* combined preview area
          className="mathjax-preview"
          // We're removing contentEditable from here because Jodit handles its own editing
          // If you want the whole combined view to be editable, you'd need a different strategy
          // suppressContentEditableWarning // No longer needed if contentEditable is removed
          // The combined content is now created by rendering two separate divs
          style={{
            // These styles were moved into the .mathjax-preview class for consistency
            // but can remain here if you prefer inline for the main container
            border: "1px solid #ccc",
            padding: "15px",
            minHeight: "200px",
            backgroundColor: "#f9f9f9",
            overflowX: 'auto'
          }}
        >
          {/* --- NEW: Separate divs for each content source --- */}
          <div ref={editorContentRef} dangerouslySetInnerHTML={{ __html: editorContent }} />
          <div ref={pandocContentRef} dangerouslySetInnerHTML={{ __html: previewContent }} />
        </div>
      </div>
    </div>
  );
}

export default App;