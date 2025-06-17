import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import RichTextEditor from './RichTextEditor';
import { dummyResponse } from "./dummyResponse"
// import { v4 as uuidv4 } from 'uuid'; // Uncomment if you install uuid

function App() {
  const [previewContent, setPreviewContent] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [openEditor, setOpenEditor] = useState(false);
  const [customList, setCustomList] = useState([])
  const [serverRes, setServerRes] = useState(dummyResponse)

  // Modal related states
  const [showModal, setShowModal] = useState(false);
  const [fontSize, setFontSize] = useState("16px"); // Controls modal input
  const [backgroundColor, setBackgroundColor] = useState(""); // Controls modal input
  const modalRef = useRef(null);

  // Selection related states
  const previewRef = useRef(null);
  const editorContentRef = useRef(null);
  const contentWrapperRef = useRef(null); // Single ref for all dynamic content
  // currentSelectedRootParentTag will now refer to the actual DOM node whose styles we want to read/apply
  const [currentSelectedRootParentTag, setCurrentSelectedRootParentTag] = useState(null);
  const [selectionTimeoutId, setSelectionTimeoutId] = useState(null);
  const [selectedFont, setSelectedFont] = useState('Inter'); // Controls modal input

  const googleFonts = [
    { name: 'Inter', value: 'Inter' },
    { name: 'Roboto', value: 'Roboto' },
    { name: 'Open Sans', value: 'Open+Sans' },
    { name: 'Lato', value: 'Lato' },
    { name: 'Montserrat', value: 'Montserrat' },
    { name: 'Playfair Display', value: 'Playfair+Display' },
    { name: 'Lora', value: 'Lora' },
    { name: 'Nunito', value: 'Nunito' },
    { name: 'Oswald', value: 'Oswald' },
    { name: 'Ubuntu', value: 'Ubuntu' },
  ];

  // Font updation (no change)
  useEffect(() => {
    const loadFont = (fontFamily) => {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@400;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    };

    googleFonts.forEach(font => loadFont(font.value));
    document.body.style.fontFamily = 'Inter, sans-serif';
  }, []);

  // Handle selection on any content to potentially show the modal
  useEffect(() => {
    const handleSelection = (e) => {
      if (modalRef.current && modalRef.current.contains(e.target)) {
        return;
      }

      if (selectionTimeoutId) {
        clearTimeout(selectionTimeoutId);
        setSelectionTimeoutId(null);
      }

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !previewRef.current) {
        setShowModal(false);
        setCurrentSelectedRootParentTag(null);
        // Reset modal inputs when selection is cleared or invalid
        setFontSize("16px");
        setBackgroundColor("");
        setSelectedFont("Inter");
        return;
      }

      const range = selection.getRangeAt(0);
      if (!previewRef.current.contains(range.commonAncestorContainer)) {
        setShowModal(false);
        setCurrentSelectedRootParentTag(null);
        setFontSize("16px");
        setBackgroundColor("");
        setSelectedFont("Inter");
        return;
      }

      // If selection is within the general editor content area
      if (editorContentRef.current && editorContentRef.current.contains(range.commonAncestorContainer)) {
        setOpenEditor(true);
        setShowModal(false);
        setCurrentSelectedRootParentTag(null);
        setFontSize("16px");
        setBackgroundColor("");
        setSelectedFont("Inter");
        return;
      }

      // If selection is within the dynamic content (customList) area
      if (contentWrapperRef.current && contentWrapperRef.current.contains(range.commonAncestorContainer)) {
        let currentElement = range.commonAncestorContainer;
        let rootParentTag = null;
        let selectedDataItemId = null; // Store the ID from data-item-id

        // Traverse up to find the direct child of contentWrapperRef that contains the selection
        while (currentElement && currentElement !== contentWrapperRef.current) {
          if (currentElement.parentElement === contentWrapperRef.current) {
            rootParentTag = currentElement;
            selectedDataItemId = rootParentTag.dataset.itemId; // Get the unique ID
            break;
          }
          currentElement = currentElement.parentElement;
        }

        if (rootParentTag && selectedDataItemId) {
          // If the selected element is an "Insert text here" button, don't show the styling modal
          if (rootParentTag.classList.contains('dynamic-action-p')) {
            setShowModal(false);
            setCurrentSelectedRootParentTag(null);
            setFontSize("16px");
            setBackgroundColor("");
            setSelectedFont("Inter");
            return;
          }

          console.log("Selected dynamic content. Root parent:", rootParentTag.tagName, "ID:", selectedDataItemId);
          setCurrentSelectedRootParentTag(rootParentTag); // Still store the DOM node for context if needed

          // Find the corresponding item in customList by its ID and set modal inputs
          const selectedItem = customList.find(item => item.id === selectedDataItemId);
          if (selectedItem && selectedItem.styles) {
            setFontSize(selectedItem.styles.fontSize);
            setBackgroundColor(selectedItem.styles.backgroundColor);
            setSelectedFont(selectedItem.styles.fontFamily);
          } else {
            // Default styles if no specific styles found for the selected item
            setFontSize("16px");
            setBackgroundColor("");
            setSelectedFont("Inter");
          }

          // Set timeout to show the modal after 3 seconds
          const id = setTimeout(() => {
            setShowModal(true);
          }, 3000);
          setSelectionTimeoutId(id);

        } else {
          console.log("Could not find a distinct root parent tag within dynamic content or missing data-item-id.");
          setShowModal(false);
          setCurrentSelectedRootParentTag(null);
          setFontSize("16px");
          setBackgroundColor("");
          setSelectedFont("Inter");
        }
      } else {
        console.log("Selection not in general preview content, hiding modal.");
        setShowModal(false);
        setCurrentSelectedRootParentTag(null);
        setFontSize("16px");
        setBackgroundColor("");
        setSelectedFont("Inter");
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
  }, [selectionTimeoutId, customList]); // Added customList to dependencies

  // Apply style to the selected element's corresponding item in customList state
  const applyStyleToSelectedElement = () => {
    if (!currentSelectedRootParentTag) {
      console.warn("No element selected to apply styles.");
      setShowModal(false);
      return;
    }

    const selectedItemId = currentSelectedRootParentTag.dataset.itemId;
    if (!selectedItemId) {
      console.error("Selected element does not have a data-item-id. Cannot update customList accurately.");
      setShowModal(false);
      return;
    }

    // Map over customList to find the item by its 'id' and update its 'styles' object
    const updatedCustomList = customList.map(item => {
      if (item.id === selectedItemId) {
        // Return a new object for immutability, updating only the 'styles'
        return {
          ...item,
          styles: {
            fontSize: fontSize,
            backgroundColor: backgroundColor,
            fontFamily: selectedFont
          },
          is_modified: true
        };
      }
      return item;
    });

    setCustomList(updatedCustomList); // This re-renders the component with new styles

    // Re-typeset MathJax, as font changes can affect its rendering dimensions
    if (window.MathJax && window.MathJax.typesetPromise) {
      setTimeout(() => {
        window.MathJax.typesetPromise([contentWrapperRef.current])
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

  const handleUpload = useCallback(() => {
    const result = [];
    result.push({
      type: "editor",
      content: '<p class="dynamic-action-p" data-action-type="insert-editor">Insert text here</p>',
      is_modified: false,
      id: "editor-initial" // Unique ID for general editor slot
    });

    for (let i = 0; i < serverRes.length; i++) {
      const uniqueId = `question-${i}-${Date.now()}`; // Generate a truly unique ID
      result.push({
        type: 'question',
        rawContent: serverRes[i].content, // Store original HTML content
        is_modified: false,
        id: uniqueId, // Store the ID within the item object
        // Default styles for the item
        styles: {
          fontSize: "16px",
          backgroundColor: "",
          fontFamily: "Inter"
        }
      });

      result.push({
        type: 'editor',
        content: `<p class="dynamic-action-p" data-action-type="insert-editor" data-file-index="${i}">Insert text here</p>`,
        is_modified: false,
        id: `editor-${i}-${Date.now()}` // Unique ID for each editor block
      });
    }

    setCustomList(result);

    setTimeout(() => {
      if (window.MathJax && window.MathJax.typesetPromise && contentWrapperRef.current) {
        window.MathJax.typesetPromise([contentWrapperRef.current])
          .then(() => {
            console.log("MathJax initial typesetting complete after upload!");
          })
          .catch(err => {
            console.error("MathJax initial typesetting error:", err);
          });
      }
    }, 100);
  }, [serverRes]);

  const handleInsertTextClick = useCallback((e) => {
    const target = e.target.closest('.dynamic-action-p[data-action-type="insert-editor"]');
    if (target) {
      alert("Opening editor for text insertion!");
      setOpenEditor(true);
      // You might want to get the data-file-index here to know which editor slot was clicked
      // const fileIndex = target.dataset.fileIndex;
    }
  }, []);

  useEffect(() => {
    const wrapper = contentWrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener('click', handleInsertTextClick);
      return () => {
        wrapper.removeEventListener('click', handleInsertTextClick);
      };
    }
  }, [handleInsertTextClick]);

  console.log("customList", customList)
  return (
    <div style={{ padding: 20 }}>
      <style>
        {`
        /* ... (your existing CSS styles) ... */
        .mathjax-preview {
            width: 100%;
            padding: 15px;
            min-height: 200px;
            background-color: #f9f9f9;
            overflow-x: auto;
            box-sizing: border-box;
            border: none;
        }

        .mathjax-preview img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
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
             border: none;
        }

        .mathjax-preview th,
        .mathjax-preview td {
            padding: 8px;
            text-align: left;
            word-wrap: break-word;
            overflow-wrap: break-word;
            box-sizing: border-box;
            border: none
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
            border: none
        }

        .mjx-chtml {
            word-wrap: normal;
            overflow-x: auto;
            display: block;
            border: none
        }
        
        .dynamic-action-p {
          background-color: #007bff;
          color: white;
          padding: 8px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: inline-block;
          margin: 5px 0;
        }
        .question-content {
            /* Now styles are applied via inline style prop */
        }
        `}
      </style>

      <h2>DOCX to HTML with MathML Preview</h2>
      <button onClick={handleUpload}>Upload & Preview</button>

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
            Insert/Edit General Text
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
            backgroundColor: "#fff",
            overflowX: 'auto'
          }}
        >
          <div ref={editorContentRef} dangerouslySetInnerHTML={{ __html: editorContent }} />

          <div ref={contentWrapperRef}>
            {customList.map((ele) => {
              if (ele.type === 'question') {
                return (
                  <div
                    key={ele.id} // Use item.id as key for React's reconciliation
                    data-item-id={ele.id} // Important for DOM lookup
                    className="question-content"
                    style={{ // Apply styles directly from the item's state
                      fontSize: ele.styles.fontSize,
                      backgroundColor: ele.styles.backgroundColor,
                      fontFamily: `${ele.styles.fontFamily}, sans-serif`
                    }}
                    dangerouslySetInnerHTML={{ __html: ele.rawContent }} // Render the original raw content
                  />
                );
              } else {
                return (
                  <div key={ele.id} dangerouslySetInnerHTML={{ __html: ele.content }} />
                );
              }
            })}
          </div>
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
              <option value="yellow">Yellow</option>
              <option value="lightblue">Light Blue</option>
              <option value="wheat">Wheat</option>
            </select>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>Font Family: </label>
            <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)}>
              {googleFonts.map((font) => (
                <option key={font.name} value={font.name}>
                  {font.name}
                </option>
              ))}
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