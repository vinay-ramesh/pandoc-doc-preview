// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";

// function App() {
//   const [file, setFile] = useState(null);
//   const [previewContent, setPreviewContent] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [fontSize, setFontSize] = useState("16px");
//   const [fontStyle, setFontStyle] = useState("normal");
//   const modalRef = useRef(null);
//   const previewRef = useRef(null);
//   const [selectionRange, setSelectionRange] = useState(null);

//  /*  // Effect for handling text selection and showing the modal
//   useEffect(() => {
//     const handleSelection = (e) => {
//       const selection = window.getSelection();

//       // If the selection is inside the modal, ignore it
//       if (modalRef.current && modalRef.current.contains(e.target)) return;

//       // If no valid selection or selection is collapsed, hide the modal
//       if (!selection || selection.isCollapsed) {
//         setShowModal(false);
//         return;
//       }

//       const range = selection.getRangeAt(0);

//       // Only allow selections within the preview area
//       if (!previewRef.current.contains(range.commonAncestorContainer)) {
//         setShowModal(false);
//         return;
//       }

//       // Store a clone of the selection range and show the modal
//       setSelectionRange(range.cloneRange());
//       setShowModal(true);
//     };

//     // Add event listeners for mouse up and key up to detect selection
//     document.addEventListener("mouseup", handleSelection);
//     document.addEventListener("keyup", handleSelection);

//     // Clean up event listeners on component unmount
//     return () => {
//       document.removeEventListener("mouseup", handleSelection);
//       document.removeEventListener("keyup", handleSelection);
//     };
//   }, []); // Empty dependency array means this effect runs once on mount */

//   // Function to apply style (font size, font style) to the selected text
//   const applyStyleToSelection = () => {
//     if (!selectionRange) return; // Exit if no selection is active

//     // Ensure the preview area has focus to work with selection
//     previewRef.current.focus();

//     const selection = window.getSelection();
//     selection.removeAllRanges(); // Clear any existing ranges
//     selection.addRange(selectionRange); // Re-apply the stored range

//     const span = document.createElement("span"); // Create a new span element

//     // Apply the selected font styles to the span
//     span.style.fontSize = fontSize;
//     span.style.fontStyle = fontStyle;
//     // Optional: Add a dashed border for visual confirmation of style change during development
//     span.style.border = "1px dashed #aaa";

//     try {
//       // Extract the content of the selection range and append it to the span
//       span.appendChild(selectionRange.extractContents());
//       // Insert the new span (with the extracted content) back into the document
//       selectionRange.insertNode(span);
//       selection.removeAllRanges(); // Clear selection after applying style
//     } catch (err) {
//       console.error("Style application failed:", err);
//     }

//     // Update the preview content state with the modified HTML
//     // This is crucial for React to recognize the change and trigger re-render if needed
//     setPreviewContent(previewRef.current.innerHTML);

//     // After updating the content, tell MathJax to re-typeset the affected area
//     // This ensures any equations within the modified text are rendered correctly
//     if (window.MathJax && window.MathJax.typesetPromise) {
//       // Target only the previewRef.current element for typesetting
//       window.MathJax.typesetPromise([previewRef.current])
//         .then(() => console.log("MathJax re-typeset complete after styling!"))
//         .catch(err => console.error("MathJax re-typesetting error:", err));
//     }

//     setShowModal(false); // Hide the style modal
//   };

//   // Handler for file input change
//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]); // Store the selected file in state
//   };

//   // Handler for uploading the file to the server
//   const handleUpload = async () => {
//     if (!file) {
//       // Use a custom modal or message box instead of alert() in production
//       alert("Please select a file first!");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", file); // Append the file to the form data
//     console.log("formData", formData)
//     try {
//       setPreviewContent("Loading and converting document..."); // Provide immediate feedback to the user

//       // Send the file to the Node.js backend
//       const res = await axios.post("http://localhost:5000/upload", formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data' // Important for file uploads
//         }
//       });
//       console.log("res", res)
//       // Set the received HTML content from the server
//       setPreviewContent(res.data.content);

//       // Crucial: After new content is loaded, tell MathJax to process it
//       // Ensure window.MathJax and its typesetPromise method are available
//       if (window.MathJax && window.MathJax.typesetPromise) {
//         // Pass the specific DOM element (previewRef.current) to typesetPromise
//         // This makes MathJax only process the new/changed content in that area
//         window.MathJax.typesetPromise([previewRef.current])
//           .then(() => {
//             console.log("MathJax typeset complete!");
//           })
//           .catch(err => {
//             console.error("MathJax typesetting error:", err);
//           });
//       } else {
//         console.warn("MathJax object not available for typesetting. Ensure it's loaded in index.html.");
//       }

//     } catch (err) {
//       console.error("Error uploading file or processing conversion", err.response ? err.response.data : err.message);
//       // Display error message to the user
//       setPreviewContent(`<p style="color: red;">Error: ${err.response ? err.response.data.error : err.message}</p>`);
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>DOCX to HTML with MathML Preview</h2>
//       <input type="file" accept=".docx" onChange={handleFileChange} />
//       <button onClick={handleUpload} disabled={!file}>Upload & Preview</button>

//       <div style={{ marginTop: 30 }}>
//         <h3>Preview</h3>
//         <div
//           ref={previewRef} // Reference to the editable content area
//           contentEditable // Makes the div editable
//           suppressContentEditableWarning // Suppresses React's warning about contentEditable
//           dangerouslySetInnerHTML={{ __html: previewContent }} // Renders the HTML content
//           style={{
//             border: "1px solid #ccc",
//             padding: "15px",
//             minHeight: "200px",
//             backgroundColor: "#f9f9f9",
//             overflowX: 'auto' // Allows horizontal scrolling for wide equations
//           }}
//         />
//       </div>

//       {/* Conditional rendering for the style modal */}
//       {showModal && (
//         <div
//           ref={modalRef} // Reference to the modal for selection handling
//           style={{
//             position: "fixed",
//             top: "30%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             backgroundColor: "#fff",
//             padding: "20px",
//             border: "1px solid #ccc",
//             boxShadow: "0 0 10px rgba(0,0,0,0.2)",
//             zIndex: 9999, // Ensure modal is on top
//           }}
//         >
//           <h4>Apply Style</h4>
//           <div style={{ marginBottom: 10 }}>
//             <label>Font Size: </label>
//             <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
//               <option value="12px">12px</option>
//               <option value="14px">14px</option>
//               <option value="16px">16px</option>
//               <option value="18px">18px</option>
//               <option value="20px">20px</option>
//               <option value="24px">24px</option>
//             </select>
//           </div>
//           <div style={{ marginBottom: 10 }}>
//             <label>Font Style: </label>
//             <select value={fontStyle} onChange={(e) => setFontStyle(e.target.value)}>
//               <option value="normal">Normal</option>
//               <option value="italic">Italic</option>
//               <option value="oblique">Oblique</option>
//             </select>
//           </div>
//           <button onClick={applyStyleToSelection}>Apply</button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css"

function App() {
  const [file, setFile] = useState(null);
  const [previewContent, setPreviewContent] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [fontSize, setFontSize] = useState("16px");
  const [fontStyle, setFontStyle] = useState("normal");
  const modalRef = useRef(null);
  const previewRef = useRef(null);
  const [selectionRange, setSelectionRange] = useState(null);

  // Effect for handling text selection and showing the modal
  useEffect(() => {
    const handleSelection = (e) => {
      const selection = window.getSelection();

      if (!selection || selection.isCollapsed) {
        // If the selection is inside the modal, or no selection, hide the modal
        setShowModal(false);
        return;
      }

      const range = selection.getRangeAt(0);

      // Only allow selections within the preview area
      if (!previewRef.current || !previewRef.current.contains(range.commonAncestorContainer)) {
        setShowModal(false);
        return;
      }

      // If the selection is inside the modal, ignore it (after checking global selection)
      if (modalRef.current && modalRef.current.contains(e.target)) return;


      // Store a clone of the selection range and show the modal
      setSelectionRange(range.cloneRange());
      setShowModal(true);
    };

    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("keyup", handleSelection); // Also check for keyboard selections

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("keyup", handleSelection);
    };
  }, []);

  // Function to apply style (font size, font style) to the selected text
  const applyStyleToSelection = async () => {
    if (!selectionRange) return;

    previewRef.current.focus(); // Ensure the editable div is focused

    const selection = window.getSelection();
    selection.removeAllRanges(); // Clear any existing ranges
    selection.addRange(selectionRange); // Re-apply the stored range

    const span = document.createElement("span");

    span.style.fontSize = fontSize;
    span.style.fontStyle = fontStyle;
    span.style.border = "1px dashed #aaa"; // Optional debug border for styled text

    try {
      span.appendChild(selectionRange.extractContents());
      selectionRange.insertNode(span);
      selection.removeAllRanges();
    } catch (err) {
      console.error("Style application failed:", err);
    }

    // Update the preview content state with the modified HTML
    setPreviewContent(previewRef.current.innerHTML);

    // After updating the content, tell MathJax to re-typeset the affected area
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([previewRef.current])
        .then(() => console.log("MathJax re-typeset complete after styling!"))
        .catch(err => console.error("MathJax re-typesetting error:", err));
    }

    setShowModal(false); // Hide the style modal
  };

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
      console.log("res.data.content", res.data.content)
      setPreviewContent(res.data.content);

      // Crucial: After new content is loaded, tell MathJax to process it
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([previewRef.current])
          .then(() => {
            console.log("MathJax typeset complete!");
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

  return (
    <div style={{ padding: 20 }}>
      {/* --- NEW/UPDATED: CSS for responsive images and other elements --- */}
      <style>
        {`
        .mathjax-preview {
            /* Ensures the container itself respects its parent's width */
            width: 100%;
            /* Other container styles */
            border: 1px solid #ccc;
            padding: 15px;
            min-height: 200px;
            background-color: #f9f9f9;
            overflow-x: auto; /* Keep this for extreme cases, but aim to avoid it */
            box-sizing: border-box; /* Crucial for consistent sizing */
        }

        .mathjax-preview img {
            max-width: 100%; /* Ensure images don't overflow their container */
            height: auto;    /* Maintain aspect ratio */
            display: block;  /* Helps with layout, prevents extra space below images */
            margin: 0 auto;  /* Center images horizontally */
            border: 1px solid #eee; /* Optional: subtle border to see image boundaries */
            box-sizing: border-box; /* Include padding/border in element's total width/height */
        }

        .mathjax-preview table {
            width: 100%; /* Make tables occupy full available width */
            table-layout: fixed; /* Distribute column widths evenly/flexibly */
            border-collapse: collapse; /* For clean table borders */
            margin-bottom: 1em; /* Space after tables */
            overflow-x: auto; /* Allow horizontal scroll for table if content is too wide */
            display: block; /* Important for overflow-x on tables to work */
            box-sizing: border-box;
        }

        .mathjax-preview th,
        .mathjax-preview td {
            padding: 8px;
            border: 1px solid #ddd;
            text-align: left;
            word-wrap: break-word; /* Wrap long words within cells */
            overflow-wrap: break-word; /* Modern equivalent */
            box-sizing: border-box;
        }

        .mathjax-preview pre,
        .mathjax-preview code {
            white-space: pre-wrap;   /* Wrap long lines of code/pre-formatted text */
            word-wrap: break-word;   /* Break words that are too long */
            overflow-x: auto;        /* Provide scrollbar if wrapping isn't enough */
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            display: block; /* Ensure it respects width */
            box-sizing: border-box;
        }

        /* General word breaking for other block elements */
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

        /* Specific for MathJax output if it overflows (usually not an issue with CHTML) */
        .mjx-chtml {
            word-wrap: normal; /* MathJax usually handles its own wrapping */
            overflow-x: auto;
            display: block; /* Ensure it respects container width */
        }
        `}
      </style>

      <h2>DOCX to HTML with MathML Preview</h2>
      <input type="file" accept=".docx" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file}>Upload & Preview</button>

      <div style={{ marginTop: 30 }}>
        <h3>Preview</h3>
        <div
          ref={previewRef}
          className="mathjax-preview"
          contentEditable
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: previewContent }}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            minHeight: "200px",
            backgroundColor: "#f9f9f9",
            overflowX: 'auto'
          }}
        />
      </div>

      {showModal && (
        <div
          ref={modalRef}
          style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            padding: "20px",
            border: "1px solid #ccc",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            zIndex: 9999,
          }}
        >
          <h4>Apply Style</h4>
          <div style={{ marginBottom: 10 }}>
            <label>Font Size: </label>
            <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
            </select>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>Font Style: </label>
            <select value={fontStyle} onChange={(e) => setFontStyle(e.target.value)}>
              <option value="normal">Normal</option>
              <option value="italic">Italic</option>
              <option value="oblique">Oblique</option>
            </select>
          </div>
          <button onClick={applyStyleToSelection}>Apply</button>
        </div>
      )}
    </div>
  );
}

export default App;