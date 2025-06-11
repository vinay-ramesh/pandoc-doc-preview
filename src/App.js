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
      console.log({selection, range})
      // Check if the selection is within the editor's content div
      if (editorContentRef.current && editorContentRef.current.contains(range.commonAncestorContainer)) {
        console.log("Selected portion is from Editor Content!");
        alert("Selected portion is from Editor Content!");
        setOpenEditor(true)
      } else if (pandocContentRef.current && pandocContentRef.current.contains(range.commonAncestorContainer)) {
        console.log("Selected portion is from Pandoc (Preview) Content!");
        // alert("Selected portion is from Pandoc (Preview) Content!");

        let currentElement = range.commonAncestorContainer;
        let rootParentTag = null;

        // Traverse upwards from the commonAncestorContainer until we reach the pandocContentRef
        while (currentElement && currentElement !== pandocContentRef.current) {
          // If the current element's parent is the pandocContentRef.current,
          // then the currentElement is the highest-level child containing the selection.
          if (currentElement.parentElement === pandocContentRef.current) {
            rootParentTag = currentElement;
            break; // Found it!
          }
          currentElement = currentElement.parentElement; // Move up the DOM tree
        }

        if (rootParentTag) {
          console.log("Root parent tag for Pandoc selection:", rootParentTag, rootParentTag.tagName);
          // alert(`Root parent tag for Pandoc selection: <${rootParentTag.tagName}>`);

          const newFontSize = "22px"; // You can get this value from a user input, a dropdown, etc.
          rootParentTag.style.fontSize = newFontSize;
          rootParentTag.style.backgroundColor = 'yellow';

          // If you also want to see the outer HTML of this root parent tag:
          // console.log("Root Parent Element HTML:", rootParentTag.outerHTML);
        } else {
          // This case might happen if the selection itself is just direct text inside pandocContentRef
          // without being wrapped in any block-level element, or if the commonAncestorContainer
          // *is* pandocContentRef.current (though our outer `if` condition should prevent this specific case).
          console.log("Could not find a distinct root parent tag within Pandoc content (might be direct text or selection spans across roots).");
          // alert("Could not find a distinct root parent tag within Pandoc content.");
        }
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