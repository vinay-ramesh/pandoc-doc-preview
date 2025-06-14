// Version 1
// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import "./App.css"; // Assuming you have this CSS file
// import RichTextEditor from './RichTextEditor';

// function App() {
//   const [file, setFile] = useState(null);
//   const [previewContent, setPreviewContent] = useState("");
//   const [editorContent, setEditorContent] = useState(""); // Content from Jodit editor
//   const [openEditor, setOpenEditor] = useState(false); // Corrected state variable name
//   const previewRef = useRef(null); // Reference to the main preview container
//   const editorContentRef = useRef(null); // Reference for the editor's content div
//   const pandocContentRef = useRef(null); // Reference for the Pandoc's content div

//   // Effect for handling text selection
//   useEffect(() => {
//     const handleSelection = (e) => {
//       const selection = window.getSelection();
//       if (!selection || selection.isCollapsed || !previewRef.current) {
//         return; // No selection or selection not within the main preview
//       }

//       const range = selection.getRangeAt(0);
//       console.log({ selection, range })
//       // Check if the selection is within the editor's content div
//       if (editorContentRef.current && editorContentRef.current.contains(range.commonAncestorContainer)) {
//         console.log("Selected portion is from Editor Content!");
//         alert("Selected portion is from Editor Content!");
//         setOpenEditor(true)
//       } else if (pandocContentRef.current && pandocContentRef.current.contains(range.commonAncestorContainer)) {
//         console.log("Selected portion is from Pandoc (Preview) Content!");
//         // alert("Selected portion is from Pandoc (Preview) Content!");

//         let currentElement = range.commonAncestorContainer;
//         let rootParentTag = null;

//         // Traverse upwards from the commonAncestorContainer until we reach the pandocContentRef
//         while (currentElement && currentElement !== pandocContentRef.current) {
//           // If the current element's parent is the pandocContentRef.current,
//           // then the currentElement is the highest-level child containing the selection.
//           if (currentElement.parentElement === pandocContentRef.current) {
//             rootParentTag = currentElement;
//             break; // Found it!
//           }
//           currentElement = currentElement.parentElement; // Move up the DOM tree
//         }

//         if (rootParentTag) {
//           console.log("Root parent tag for Pandoc selection:", rootParentTag, rootParentTag.tagName);
//           // alert(`Root parent tag for Pandoc selection: <${rootParentTag.tagName}>`);
//           const newFontSize = "22px"; // You can get this value from a user input, a dropdown, etc.
//           rootParentTag.style.fontSize = newFontSize;
//           rootParentTag.style.backgroundColor = 'yellow';
//           // If you also want to see the outer HTML of this root parent tag:
//           // console.log("Root Parent Element HTML:", rootParentTag.outerHTML);
//         } else {
//           // This case might happen if the selection itself is just direct text inside pandocContentRef
//           // without being wrapped in any block-level element, or if the commonAncestorContainer
//           // *is* pandocContentRef.current (though our outer `if` condition should prevent this specific case).
//           console.log("Could not find a distinct root parent tag within Pandoc content (might be direct text or selection spans across roots).");
//           // alert("Could not find a distinct root parent tag within Pandoc content.");
//         }
//       }
//       // If the selection spans across both or outside, you might need more complex logic
//       else if (previewRef.current.contains(range.commonAncestorContainer)) {
//         // This case handles selections within the overall preview, but not specifically in one of the wrapped divs
//         // (e.g., if you had text directly in previewContent's outer div that wasn't wrapped, or a selection spanning both)
//         console.log("Selected portion is within the combined Preview Area (could be mixed or unclassified).");
//         alert("Selected portion is within the combined Preview Area (could be mixed or unclassified).");
//       }
//     };

//     document.addEventListener("mouseup", handleSelection);
//     document.addEventListener("keyup", handleSelection);

//     return () => {
//       document.removeEventListener("mouseup", handleSelection);
//       document.removeEventListener("keyup", handleSelection);
//     };
//   }, []); // Empty dependency array means this runs once on mount

//   // Handler for file input change
//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   // Handler for uploading the file to the server
//   const handleUpload = async () => {
//     if (!file) {
//       alert("Please select a file first!");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       setPreviewContent("Loading and converting document..."); // Provide immediate feedback
//       const res = await axios.post("http://localhost:5000/upload", formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });
//       setPreviewContent(res.data.content);

//       // Crucial: After new content is loaded, tell MathJax to process it
//       // Pass both content refs if MathJax needs to process elements within both divs
//       if (window.MathJax && window.MathJax.typesetPromise) {
//         window.MathJax.typesetPromise([editorContentRef.current, pandocContentRef.current])
//           .then(() => {
//             console.log("MathJax typeset complete for all content!");
//           })
//           .catch(err => {
//             console.error("MathJax typesetting error:", err);
//           });
//       } else {
//         console.warn("MathJax object not available for typesetting. Ensure it's loaded in index.html.");
//       }

//     } catch (err) {
//       console.error("Error uploading file or processing conversion", err.response ? err.response.data : err.message);
//       setPreviewContent(`<p style="color: red;">Error: ${err.response ? err.response.data.error : err.message}</p>`);
//     }
//   };
//   // console.log("previewContent", previewContent)

//   return (
//     <div style={{ padding: 20 }}>
//       {/* --- NEW/UPDATED: CSS for responsive images and other elements --- */}
//       <style>
//         {`
//         .mathjax-preview {
//             width: 100%;
//             border: 1px solid #ccc;
//             padding: 15px;
//             min-height: 200px;
//             background-color: #f9f9f9;
//             overflow-x: auto;
//             box-sizing: border-box;
//         }

//         .mathjax-preview img {
//             max-width: 100%;
//             height: auto;
//             display: block;
//             margin: 0 auto;
//             border: 1px solid #eee;
//             box-sizing: border-box;
//         }

//         .mathjax-preview table {
//             width: 100%;
//             table-layout: fixed;
//             border-collapse: collapse;
//             margin-bottom: 1em;
//             overflow-x: auto;
//             display: block;
//             box-sizing: border-box;
//         }

//         .mathjax-preview th,
//         .mathjax-preview td {
//             padding: 8px;
//             border: 1px solid #ddd;
//             text-align: left;
//             word-wrap: break-word;
//             overflow-wrap: break-word;
//             box-sizing: border-box;
//         }

//         .mathjax-preview pre,
//         .mathjax-preview code {
//             white-space: pre-wrap;
//             word-wrap: break-word;
//             overflow-x: auto;
//             background-color: #f5f5f5;
//             padding: 10px;
//             border-radius: 4px;
//             display: block;
//             box-sizing: border-box;
//         }

//         .mathjax-preview p,
//         .mathjax-preview h1,
//         .mathjax-preview h2,
//         .mathjax-preview h3,
//         .mathjax-preview h4,
//         .mathjax-preview h5,
//         .mathjax-preview h6,
//         .mathjax-preview li {
//             word-wrap: break-word;
//             overflow-wrap: break-word;
//         }

//         .mjx-chtml {
//             word-wrap: normal;
//             overflow-x: auto;
//             display: block;
//         }
//         `}
//       </style>

//       <h2>DOCX to HTML with MathML Preview</h2>
//       <input type="file" accept=".docx" onChange={handleFileChange} />
//       <button onClick={handleUpload} disabled={!file}>Upload & Preview</button>

//       <div style={{ marginTop: 30 }}>
//         <div>
//           {openEditor && (
//             <div className="h-full overflow-auto flex flex-col w-full">
//               <RichTextEditor initialValue={editorContent} onChange={setEditorContent} />
//               <button onClick={() => setOpenEditor(false)} className="p-2 w-fit border-2 rounded shadow">
//                 Save Text
//               </button>
//             </div>
//           )}
//           <button className="p-2 w-fit border-2 rounded shadow" onClick={() => setOpenEditor(true)}>
//             Insert/Edit Text
//           </button>
//         </div>

//         <h3>Combined Preview</h3>
//         <div
//           ref={previewRef} // This ref is for the *entire* combined preview area
//           className="mathjax-preview"
//           // We're removing contentEditable from here because Jodit handles its own editing
//           // If you want the whole combined view to be editable, you'd need a different strategy
//           // suppressContentEditableWarning // No longer needed if contentEditable is removed
//           // The combined content is now created by rendering two separate divs
//           style={{
//             // These styles were moved into the .mathjax-preview class for consistency
//             // but can remain here if you prefer inline for the main container
//             border: "1px solid #ccc",
//             padding: "15px",
//             minHeight: "200px",
//             backgroundColor: "#f9f9f9",
//             overflowX: 'auto'
//           }}
//         >
//           {/* --- NEW: Separate divs for each content source --- */}
//           <div ref={editorContentRef} dangerouslySetInnerHTML={{ __html: editorContent }} />
//           <div ref={pandocContentRef} dangerouslySetInnerHTML={{ __html: previewContent }} />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;

// Version 2 -- working
// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import "./App.css";
// import RichTextEditor from './RichTextEditor';

// function App() {
//   const [file, setFile] = useState(null);
//   const [previewContent, setPreviewContent] = useState("");
//   const [editorContent, setEditorContent] = useState("");
//   const [openEditor, setOpenEditor] = useState(false);

//   // Modal related states
//   const [showModal, setShowModal] = useState(false);
//   const [fontSize, setFontSize] = useState("16px");
//   const [backgroundColor, setBackgroundColor] = useState("");
//   const modalRef = useRef(null);

//   // Selection related states
//   const previewRef = useRef(null);
//   const editorContentRef = useRef(null);
//   const pandocContentRef = useRef(null);
//   const [currentSelectedRootParentTag, setCurrentSelectedRootParentTag] = useState(null);
//   const [selectionTimeoutId, setSelectionTimeoutId] = useState(null);
//   const [selectedFont, setSelectedFont] = useState('Inter');

//   const googleFonts = [
//     { name: 'Inter', value: 'Inter' },
//     { name: 'Roboto', value: 'Roboto' },
//     { name: 'Open Sans', value: 'Open+Sans' },
//     { name: 'Lato', value: 'Lato' },
//     { name: 'Montserrat', value: 'Montserrat' },
//     { name: 'Playfair Display', value: 'Playfair+Display' },
//     { name: 'Lora', value: 'Lora' },
//     { name: 'Nunito', value: 'Nunito' },
//     { name: 'Oswald', value: 'Oswald' },
//     { name: 'Ubuntu', value: 'Ubuntu' },
//   ];

//   useEffect(() => {
//     // Function to create and append a <link> tag for a Google Font
//     const loadFont = (fontFamily) => {
//       const link = document.createElement('link');
//       link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@400;700&display=swap`;
//       link.rel = 'stylesheet';
//       document.head.appendChild(link);
//       // Optionally, remove the link when the component unmounts
//       return () => {
//           document.head.removeChild(link);
//       };
//     };

//     // Load each font from the googleFonts list
//     googleFonts.forEach(font => loadFont(font.value));

//     // Set the initial font to Inter (or another default from your list)
//     // Ensure 'Inter' is always loaded or pick a different default if not
//     document.body.style.fontFamily = 'Inter, sans-serif';
//   }, []);

//   useEffect(() => {
//     const handleSelection = (e) => {
//       if (modalRef.current && modalRef.current.contains(e.target)) {
//         return;
//       }

//       if (selectionTimeoutId) {
//         clearTimeout(selectionTimeoutId);
//       }

//       const selection = window.getSelection();
//       if (!selection || selection.isCollapsed || !previewRef.current) {
//         setShowModal(false);
//         setCurrentSelectedRootParentTag(null);
//         return;
//       }

//       const range = selection.getRangeAt(0);
//       if (!previewRef.current.contains(range.commonAncestorContainer)) {
//         setShowModal(false);
//         setCurrentSelectedRootParentTag(null);
//         return;
//       }

//       if (editorContentRef.current && editorContentRef.current.contains(range.commonAncestorContainer)) {
//         //         console.log("Selected portion is from Editor Content!");
//         //         alert("Selected portion is from Editor Content!");
//         setOpenEditor(true)
//       }
//       if (pandocContentRef.current && pandocContentRef.current.contains(range.commonAncestorContainer)) {
//         let currentElement = range.commonAncestorContainer;
//         let rootParentTag = null;

//         while (currentElement && currentElement !== pandocContentRef.current) {
//           if (currentElement.parentElement === pandocContentRef.current) {
//             rootParentTag = currentElement;
//             break;
//           }
//           currentElement = currentElement.parentElement;
//         }

//         if (rootParentTag) {
//           console.log("Selected portion is from Pandoc (Preview) Content. Root parent tag:", rootParentTag.tagName);
//           setCurrentSelectedRootParentTag(rootParentTag);

//           const id = setTimeout(() => {
//             setShowModal(true);
//           }, 3000);
//           setSelectionTimeoutId(id);

//         } else {
//           console.log("Could not find a distinct root parent tag within Pandoc content.");
//           setShowModal(false);
//           setCurrentSelectedRootParentTag(null);
//         }
//       } else {
//         console.log("Selection not in Pandoc content, hiding modal.");
//         setShowModal(false);
//         setCurrentSelectedRootParentTag(null);
//       }
//     };

//     document.addEventListener("mouseup", handleSelection);
//     document.addEventListener("keyup", handleSelection);

//     return () => {
//       document.removeEventListener("mouseup", handleSelection);
//       document.removeEventListener("keyup", handleSelection);
//       if (selectionTimeoutId) {
//         clearTimeout(selectionTimeoutId);
//       }
//     };
//   }, [selectionTimeoutId]);

//   // --- MODIFIED FUNCTION TO PERSIST STYLE IN HTML STRING ---
//   const applyStyleToSelectedElement = () => {
//     if (!currentSelectedRootParentTag) {
//       console.warn("No element selected to apply styles.");
//       setShowModal(false);
//       return;
//     }

//     // 1. Get the current outerHTML of the element from the live DOM
//     // This string needs to precisely match a substring in `previewContent` for replacement.
//     const originalOuterHTML = currentSelectedRootParentTag.outerHTML;

//     // 2. Create a temporary DOM element in memory to modify its style
//     const tempDiv = document.createElement('div');
//     tempDiv.innerHTML = originalOuterHTML;
//     const elementToModify = tempDiv.firstChild; // This is the root element parsed from the string

//     if (!elementToModify || elementToModify.nodeType !== Node.ELEMENT_NODE) {
//       console.error("Failed to parse element for style modification from string.");
//       setShowModal(false);
//       return;
//     }

//     // 3. Apply the new styles to this temporary, detached element
//     elementToModify.style.fontSize = fontSize;
//     elementToModify.style.backgroundColor = backgroundColor;
//     elementToModify.style.fontFamily = selectedFont;

//     // document.body.style.fontFamily = `${selectedFont}, sans-serif`;

//     // 4. Get the outerHTML of the modified temporary element
//     const modifiedOuterHTML = tempDiv.innerHTML;

//     // 5. Replace the original HTML string with the modified HTML string in the state
//     // This is the most fragile part of this approach due to string matching.
//     const updatedPreviewContent = previewContent.replace(originalOuterHTML, modifiedOuterHTML);

//     if (updatedPreviewContent === previewContent) {
//       console.warn("No replacement occurred. Original HTML might not have been found exactly matching in previewContent. This can happen due to minor parsing differences or attribute order changes by the browser.");
//       // Optionally, as a fallback, you could still apply it directly to the DOM for immediate visual
//       // currentSelectedRootParentTag.style.fontSize = fontSize;
//       // currentSelectedRootParentTag.style.backgroundColor = backgroundColor;
//     }

//     // 6. Update the React state, which triggers a re-render of the `dangerouslySetInnerHTML`
//     setPreviewContent(updatedPreviewContent);

//     // 7. Trigger MathJax re-typesetting for the new content after React has updated the DOM
//     if (window.MathJax && window.MathJax.typesetPromise) {
//       // A small timeout helps ensure React has completed its DOM update before MathJax runs.
//       setTimeout(() => {
//         window.MathJax.typesetPromise([pandocContentRef.current])
//           .then(() => {
//             console.log("MathJax re-typeset complete after style persistence!");
//           })
//           .catch(err => {
//             console.error("MathJax re-typesetting error after style persistence:", err);
//           });
//       }, 50); // 50ms delay
//     } else {
//       console.warn("MathJax object not available for typesetting. Ensure it's loaded in index.html.");
//     }

//     setShowModal(false); // Hide the modal after applying styles
//     setCurrentSelectedRootParentTag(null); // Clear the stored element
//   };
//   // --- END MODIFIED FUNCTION ---

//   // ... (rest of your App.js code remains the same) ...
//   const handleFileChange = (e) => {
//     // setFile(e.target.files[0]);
//     setFile(e.target.files); 
//   };

//   // const handleUpload = async () => {
//   //   if (!file) {
//   //     alert("Please select a file first!");
//   //     return;
//   //   }

//   //   const formData = new FormData();
//   //   formData.append("file", file);

//   //   try {
//   //     setPreviewContent("Loading and converting document...");
//   //     const res = await axios.post("http://localhost:5000/upload", formData, {
//   //       headers: {
//   //         'Content-Type': 'multipart/form-data'
//   //       }
//   //     });
//   //     setPreviewContent(res.data.content);

//   //     if (window.MathJax && window.MathJax.typesetPromise) {
//   //       window.MathJax.typesetPromise([editorContentRef.current, pandocContentRef.current])
//   //         .then(() => {
//   //           console.log("MathJax typeset complete for all content!");
//   //         })
//   //         .catch(err => {
//   //           console.error("MathJax typesetting error:", err);
//   //         });
//   //     } else {
//   //       console.warn("MathJax object not available for typesetting. Ensure it's loaded in index.html.");
//   //     }

//   //   } catch (err) {
//   //     console.error("Error uploading file or processing conversion", err.response ? err.response.data : err.message);
//   //     setPreviewContent(`<p style="color: red;">Error: ${err.response ? err.response.data.error : err.message}</p>`);
//   //   }
//   // };

//   const handleClick = () => {
//     console.log("clicked")
//   }

//   const handleUpload = async () => {
//     if (!file || file.length === 0) { // Check if 'file' (FileList) is empty
//       alert("Please select files first!");
//       return;
//     }

//     const formData = new FormData();
//     // Loop through the FileList and append each file with the correct field name "files"
//     for (let i = 0; i < file.length; i++) {
//       formData.append("files", file[i]); // <--- THIS IS THE CRUCIAL LINE: "files" (plural)
//     }

//     try {
//       setPreviewContent("Loading and converting documents...");
//       const res = await axios.post("http://localhost:5000/upload", formData, {
//         headers: {
//           'Content-Type': 'multipart/form-type'
//         }
//       });

//       // ... (rest of your response handling logic for multiple files) ...
//       if (res.data.contents && res.data.contents.length > 0) {
//         // const combinedHtml = res.data.contents.map(item => `
//         //     <div style="border: 1px dashed #ccc; padding: 10px; margin-bottom: 10px;">
//         //       <h3>File: ${item.filename}</h3>
//         //       ${item.content}
//         //     </div>
//         //   `).join('');
//         const combinedHtml = res.data.contents.map(item => `
//             qno ${item.content}
//             <button  onClick="handleClick()">Click</button>
//               <div>
//                         <button onclick="handleAdmission()">Admit</button>
//                         <button onclick="handleAdmission()">Deny</button>
//                     </div>
//         `).join('');
//         setPreviewContent(combinedHtml);

//         if (res.data.failed && res.data.failed.length > 0) {
//           alert(`Some files failed to convert: ${res.data.failed.map(f => f.filename).join(', ')}. Check console for details.`);
//           console.error("Failed conversions:", res.data.failed);
//         }
//       } else {
//         setPreviewContent("<p style='color: red;'>No content received.</p>");
//       }

//       // Re-typeset MathJax if necessary after updating content
//       if (window.MathJax && window.MathJax.typesetPromise) {
//         setTimeout(() => { // Small delay to ensure DOM is updated
//           window.MathJax.typesetPromise([pandocContentRef.current, editorContentRef.current])
//             .then(() => console.log("MathJax typeset complete for combined content!"))
//             .catch(err => console.error("MathJax typesetting error:", err));
//         }, 50);
//       }


//     } catch (err) {
//       console.error("Error uploading files or processing conversion", err.response ? err.response.data : err.message);
//       setPreviewContent(`<p style="color: red;">Error: ${err.response ? err.response.data.error : err.message}</p>`);
//     }
//   };

//   const handlePrint = () => {
//     if (!previewRef.current) {
//       console.error("The div reference for PDF generation is null.");
//       return;
//     }

//     // Check if html2pdf is loaded
//     if (typeof window.html2pdf === 'undefined') {
//       console.error("html2pdf.js library is not loaded. Please ensure the CDN script is included.");
//       // Provide a user-friendly message or fallback here if needed
//       return;
//     }

//     // PDF options
//     const options = {
//       margin: 5,
//       filename: 'document_content.pdf',
//       image: { type: 'jpeg', quality: 0.98 },
//       html2canvas: { scale: 2, logging: true, useCORS: true }, // scale up for better quality
//       jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
//     };

//     // Use html2pdf to generate the PDF
//     window.html2pdf().set(options).from(previewRef.current).save();
//   };
//   console.log("previewContent", previewContent)
//   return (
//     <div style={{ padding: 20 }}>
//       <style>
//         {`
//         .mathjax-preview {
//             width: 100%;
//             border: 1px solid #ccc;
//             padding: 15px;
//             min-height: 200px;
//             background-color: #f9f9f9;
//             overflow-x: auto;
//             box-sizing: border-box;
//         }

//         .mathjax-preview img {
//             max-width: 100%;
//             height: auto;
//             display: block;
//             margin: 0 auto;
//             border: 1px solid #eee;
//             box-sizing: border-box;
//         }

//         .mathjax-preview table {
//             width: 100%;
//             table-layout: fixed;
//             border-collapse: collapse;
//             margin-bottom: 1em;
//             overflow-x: auto;
//             display: block;
//             box-sizing: border-box;
//         }

//         .mathjax-preview th,
//         .mathjax-preview td {
//             padding: 8px;
//             border: 1px solid #ddd;
//             text-align: left;
//             word-wrap: break-word;
//             overflow-wrap: break-word;
//             box-sizing: border-box;
//         }

//         .mathjax-preview pre,
//         .mathjax-preview code {
//             white-space: pre-wrap;
//             word-wrap: break-word;
//             overflow-x: auto;
//             background-color: #f5f5f5;
//             padding: 10px;
//             border-radius: 4px;
//             display: block;
//             box-sizing: border-box;
//         }

//         .mathjax-preview p,
//         .mathjax-preview h1,
//         .mathjax-preview h2,
//         .mathjax-preview h3,
//         .mathjax-preview h4,
//         .mathjax-preview h5,
//         .mathjax-preview h6,
//         .mathjax-preview li {
//             word-wrap: break-word;
//             overflow-wrap: break-word;
//         }

//         .mjx-chtml {
//             word-wrap: normal;
//             overflow-x: auto;
//             display: block;
//         }
//         `}
//       </style>

//       <h2>DOCX to HTML with MathML Preview</h2>
//       <input type="file" accept=".docx" onChange={handleFileChange} multiple />
//       <button onClick={handleUpload} disabled={!file}>Upload & Preview</button>

//       <div style={{ marginTop: 30 }}>
//         <div>
//           {openEditor && (
//             <div className="h-full overflow-auto flex flex-col w-full">
//               <RichTextEditor initialValue={editorContent} onChange={setEditorContent} />
//               <button onClick={() => setOpenEditor(false)} className="p-2 w-fit border-2 rounded shadow">
//                 Save Text
//               </button>
//             </div>
//           )}
//           <button className="p-2 w-fit border-2 rounded shadow" onClick={() => setOpenEditor(true)}>
//             Insert/Edit Text
//           </button>
//         </div>

//         <h3>Combined Preview</h3>
//         <button
//           onClick={handlePrint}
//         >
//           Download Content as PDF
//         </button>
//         <div
//           ref={previewRef}
//           className="mathjax-preview"
//           style={{
//             border: "1px solid #ccc",
//             padding: "15px",
//             minHeight: "200px",
//             backgroundColor: "#fff",
//             overflowX: 'auto'
//           }}
//         >
//           <div ref={editorContentRef} dangerouslySetInnerHTML={{ __html: editorContent }} />
//           <div ref={pandocContentRef} dangerouslySetInnerHTML={{ __html: previewContent }} />
//         </div>
//       </div>

//       {showModal && (
//         <div
//           ref={modalRef}
//           style={{
//             position: "fixed",
//             top: "30%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             backgroundColor: "#fff",
//             padding: "20px",
//             border: "1px solid #ccc",
//             boxShadow: "0 0 10px rgba(0,0,0,0.2)",
//             zIndex: 9999,
//           }}
//         >
//           <h4>Apply Style to Root Parent Tag</h4>
//           <div style={{ marginBottom: 10 }}>
//             <label>Font Size: </label>
//             <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
//               {Array.from({ length: (30 - 12) / 2 + 1 }, (_, i) => 12 + i * 2).map(size => (
//                 <option key={size} value={`${size}px`}>{size}px</option>
//               ))}
//             </select>
//           </div>
//           <div style={{ marginBottom: 10 }}>
//             <label>Background Color: </label>
//             <select value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)}>
//               <option value="">None</option>
//               <option value="yellow">Yellow</option>
//               <option value="lightblue">Light Blue</option>
//               <option value="wheat">Wheat</option>
//             </select>
//           </div>
//           <div style={{ marginBottom: 10 }}>
//             <label>Background Color: </label>
//             <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)}>
//               {googleFonts.map((font) => (
//                 <option key={font.name} value={font.name}>
//                   {font.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <button onClick={applyStyleToSelectedElement} style={{ marginRight: '10px' }}>Apply</button>
//           <button onClick={() => { setShowModal(false); setCurrentSelectedRootParentTag(null); }}>Cancel</button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import RichTextEditor from './RichTextEditor';

function App() {
  const [file, setFile] = useState(null);
  const [previewContent, setPreviewContent] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [openEditor, setOpenEditor] = useState(false);

  // Modal related states
  const [showModal, setShowModal] = useState(false);
  const [fontSize, setFontSize] = useState("16px");
  const [backgroundColor, setBackgroundColor] = useState("");
  const modalRef = useRef(null);

  // Selection related states
  const previewRef = useRef(null);
  const editorContentRef = useRef(null);
  const pandocContentRef = useRef(null); // Ref for Pandoc content section
  const [currentSelectedRootParentTag, setCurrentSelectedRootParentTag] = useState(null);
  const [selectionTimeoutId, setSelectionTimeoutId] = useState(null);

  // --- NEW: Function to handle clicks on dynamically added buttons ---
  const handleDynamicButtonClick = (fileIndex) => {
    console.log(`Dynamic button clicked for file index: ${fileIndex}`);
    // You can add more specific logic here, e.g.,
    // - Open a different modal for this specific file.
    // - Perform some action related to the content of this specific file.
    // - Log the file details (you'd need to store res.data.contents in a state if you need full access here).
  };

  // --- NEW: useEffect to attach event listeners to dynamic buttons ---
  useEffect(() => {
    // Ensure the preview content area is rendered
    if (!pandocContentRef.current) return;

    // Select all buttons with the specific class within the pandoc content section
    // We add a class `dynamic-action-button` to the button in the HTML string below
    const buttons = pandocContentRef.current.querySelectorAll('.dynamic-action-button');

    // Function to attach listeners
    const attachListeners = () => {
      buttons.forEach(button => {
        // Get the file index from the data attribute (which we'll add to the HTML string)
        const fileIndex = parseInt(button.dataset.fileIndex, 10);
        // Create a specific listener function for this button
        const listener = () => handleDynamicButtonClick(fileIndex);
        button.addEventListener('click', listener);
        // Store the listener reference directly on the DOM element for easy cleanup
        button._dynamicClickListener = listener;
      });
    };

    // Function to remove listeners (for cleanup)
    const removeListeners = () => {
      buttons.forEach(button => {
        if (button._dynamicClickListener) {
          button.removeEventListener('click', button._dynamicClickListener);
          delete button._dynamicClickListener; // Remove the stored reference
        }
      });
    };

    // Attach listeners initially
    attachListeners();

    // Return a cleanup function to remove listeners when the component unmounts
    // or when the dependencies (previewContent or editorContent) change, causing re-render
    return () => {
      removeListeners();
    };
    // Re-run this effect whenever previewContent or editorContent changes,
    // because dangerouslySetInnerHTML will have re-rendered the content.
  }, [previewContent, editorContent]);

  // Effect for handling text selection and showing the modal after a delay
  useEffect(() => {
    const handleSelection = (e) => {
      if (modalRef.current && modalRef.current.contains(e.target)) {
        return;
      }

      if (selectionTimeoutId) {
        clearTimeout(selectionTimeoutId);
      }

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !previewRef.current) {
        setShowModal(false);
        setCurrentSelectedRootParentTag(null);
        return;
      }

      const range = selection.getRangeAt(0);
      if (!previewRef.current.contains(range.commonAncestorContainer)) {
        setShowModal(false);
        setCurrentSelectedRootParentTag(null);
        return;
      }

      if (pandocContentRef.current && pandocContentRef.current.contains(range.commonAncestorContainer)) {
        let currentElement = range.commonAncestorContainer;
        let rootParentTag = null;

        while (currentElement && currentElement !== pandocContentRef.current) {
          if (currentElement.parentElement === pandocContentRef.current) {
            rootParentTag = currentElement;
            break;
          }
          currentElement = currentElement.parentElement;
        }

        if (rootParentTag) {
          console.log("Selected portion is from Pandoc (Preview) Content. Root parent tag:", rootParentTag.tagName);
          setCurrentSelectedRootParentTag(rootParentTag);

          const id = setTimeout(() => {
            setShowModal(true);
          }, 3000);
          setSelectionTimeoutId(id);

        } else {
          console.log("Could not find a distinct root parent tag within Pandoc content.");
          setShowModal(false);
          setCurrentSelectedRootParentTag(null);
        }
      } else {
        console.log("Selection not in Pandoc content, hiding modal.");
        setShowModal(false);
        setCurrentSelectedRootParentTag(null);
      }
    };

    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("keyup", handleSelection);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("keyup", handleSelection);
      if (selectionTimeoutId) {
        clearTimeout(selectionTimeoutId);
      }
    };
  }, [selectionTimeoutId]);

  const applyStyleToSelectedElement = () => {
    if (!currentSelectedRootParentTag) {
      console.warn("No element selected to apply styles.");
      setShowModal(false);
      return;
    }

    const originalOuterHTML = currentSelectedRootParentTag.outerHTML;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = originalOuterHTML;
    const elementToModify = tempDiv.firstChild;

    if (!elementToModify || elementToModify.nodeType !== Node.ELEMENT_NODE) {
      console.error("Failed to parse element for style modification from string.");
      setShowModal(false);
      return;
    }

    elementToModify.style.fontSize = fontSize;
    elementToModify.style.backgroundColor = backgroundColor;
    const modifiedOuterHTML = tempDiv.innerHTML;

    const updatedPreviewContent = previewContent.replace(originalOuterHTML, modifiedOuterHTML);

    if (updatedPreviewContent === previewContent) {
      console.warn("No replacement occurred. Original HTML might not have been found exactly matching in previewContent. This can happen due to minor parsing differences or attribute order changes by the browser.");
    }

    setPreviewContent(updatedPreviewContent);

    if (window.MathJax && window.MathJax.typesetPromise) {
      setTimeout(() => {
        window.MathJax.typesetPromise([pandocContentRef.current])
          .then(() => {
            console.log("MathJax re-typeset complete after style persistence!");
          })
          .catch(err => {
            console.error("MathJax re-typesetting error after style persistence:", err);
          });
      }, 50);
    } else {
      console.warn("MathJax object not available for typesetting. Ensure it's loaded in index.html.");
    }

    setShowModal(false);
    setCurrentSelectedRootParentTag(null);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files); // Store FileList for multiple files
  };

  const handleUpload = async () => {
    if (!file || file.length === 0) {
      alert("Please select files first!");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < file.length; i++) {
      formData.append("files", file[i]); // Ensure "files" (plural) matches server config
    }

    try {
      setPreviewContent("Loading and converting documents...");
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.contents && res.data.contents.length > 0) {
        // --- MODIFIED: Include class and data attribute for dynamic buttons ---
        const combinedHtml = res.data.contents.map((item, index) => `
            <div class="file-section" style="margin-bottom: 20px; padding: 15px; display:flex; border: 1px solid #eee; border-radius: 5px;">
              <h3>File: ${item.filename}</h3>
              <p>Question No: ${index + 1}</p>
              ${item.content}
              <button class="dynamic-action-button" data-file-index="${index}" 
                      style="background-color: #007bff; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer;">
                Click for ${item.filename}
              </button>
            </div>
          `).join('');
        setPreviewContent(combinedHtml);

        if (res.data.failed && res.data.failed.length > 0) {
          alert(`Some files failed to convert: ${res.data.failed.map(f => f.filename).join(', ')}. Check console for details.`);
          console.error("Failed conversions:", res.data.failed);
        }

      } else {
        setPreviewContent("<p style='color: red;'>No content received.</p>");
      }

      // MathJax typesetting for the combined content
      if (window.MathJax && window.MathJax.typesetPromise) {
        setTimeout(() => { // Small delay to ensure DOM is updated
          window.MathJax.typesetPromise([pandocContentRef.current, editorContentRef.current])
            .then(() => console.log("MathJax typeset complete for combined content!"))
            .catch(err => console.error("MathJax typesetting error:", err));
        }, 50);
      }

    } catch (err) {
      console.error("Error uploading files or processing conversion", err.response ? err.response.data : err.message);
      setPreviewContent(`<p style="color: red;">Error: ${err.response ? err.response.data.error : err.message}</p>`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
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
      <input type="file" accept=".docx" onChange={handleFileChange} multiple /> {/* Added 'multiple' */}
      <button onClick={handleUpload} disabled={!file || file.length === 0}>Upload & Preview</button>

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
          ref={previewRef}
          className="mathjax-preview"
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            minHeight: "200px",
            backgroundColor: "#f9f9f9",
            overflowX: 'auto'
          }}
        >
          <div ref={editorContentRef} dangerouslySetInnerHTML={{ __html: editorContent }} />
          {/* pandocContentRef now points to the main div holding dynamically loaded content */}
          <div ref={pandocContentRef} dangerouslySetInnerHTML={{ __html: previewContent }} />
        </div>
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
          <h4>Apply Style to Root Parent Tag</h4>
          <div style={{ marginBottom: 10 }}>
            <label>Font Size: </label>
            <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
              {Array.from({ length: (30 - 12) / 2 + 1 }, (_, i) => 12 + i * 2).map(size => (
                <option key={size} value={`${size}px`}>{size}px</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>Background Color: </label>
            <select value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)}>
              <option value="">None</option>
              <option value="pale yellow">Pale Yellow</option>
              <option value="lightblue">Light Blue</option>
              <option value="wheat">Wheat</option>
            </select>
          </div>
          <button onClick={applyStyleToSelectedElement} style={{ marginRight: '10px' }}>Apply</button>
          <button onClick={() => { setShowModal(false); setCurrentSelectedRootParentTag(null); }}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default App;