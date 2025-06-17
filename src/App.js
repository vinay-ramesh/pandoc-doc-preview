import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import RichTextEditor from './RichTextEditor';
import { dummyResponse } from "./dummyResponse"

function App() {
  const [previewContent, setPreviewContent] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [openEditor, setOpenEditor] = useState(false);
  const [customList, setCustomList] = useState([])
  const [serverRes, setServerRes] = useState(dummyResponse)

  // Modal related states
  const [showModal, setShowModal] = useState(false);
  const [fontSize, setFontSize] = useState("16px");
  const [backgroundColor, setBackgroundColor] = useState("");
  const modalRef = useRef(null);

  // Selection related states
  const previewRef = useRef(null);
  const pandocContentRef = useRef(null);
  const [currentSelectedRootParentTag, setCurrentSelectedRootParentTag] = useState(null);
  const [selectionTimeoutId, setSelectionTimeoutId] = useState(null);
  const [selectedFont, setSelectedFont] = useState('Inter');

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

  // Font updation
  useEffect(() => {
    // Function to create and append a <link> tag for a Google Font
    const loadFont = (fontFamily) => {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@400;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    };

    // Load each font from the googleFonts list
    googleFonts.forEach(font => loadFont(font.value));

    // Set the initial font to Inter (or another default from your list)
    // Ensure 'Inter' is always loaded or pick a different default if not
    document.body.style.fontFamily = 'Inter, sans-serif';
  }, []);

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
            // setSelectedIndex()
          }, 1000);
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

  // --- MODIFIED FUNCTION TO PERSIST STYLE IN HTML STRING ---
  const applyStyleToSelectedElement = () => {
    if (!currentSelectedRootParentTag) {
      console.warn("No element selected to apply styles.");
      setShowModal(false);
      return;
    }

    // 1. Get the current outerHTML of the element from the live DOM
    // This string needs to precisely match a substring in `previewContent` for replacement.
    const originalOuterHTML = currentSelectedRootParentTag.outerHTML;
    console.log("originalOuterHTML", originalOuterHTML)
    // 2. Create a temporary DOM element in memory to modify its style
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = originalOuterHTML;
    const elementToModify = tempDiv.firstChild; // This is the root element parsed from the string
    console.log("elementToModify", elementToModify)
    if (!elementToModify || elementToModify.nodeType !== Node.ELEMENT_NODE) {
      console.error("Failed to parse element for style modification from string.");
      setShowModal(false);
      return;
    }

    // 3. Apply the new styles to this temporary, detached element
    elementToModify.style.fontSize = fontSize;
    elementToModify.style.backgroundColor = backgroundColor;
    elementToModify.style.fontFamily = selectedFont;

    // document.body.style.fontFamily = `${selectedFont}, sans-serif`;

    // 4. Get the outerHTML of the modified temporary element
    const modifiedOuterHTML = tempDiv.innerHTML;
    console.log("modifiedContent", modifiedOuterHTML)
    // 5. Replace the original HTML string with the modified HTML string in the state
    // This is the most fragile part of this approach due to string matching.
    const updatedPreviewContent = previewContent.replace(originalOuterHTML, modifiedOuterHTML);
    console.log("updatedPreview", updatedPreviewContent)
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
      }, 50); // 50ms delay
    } else {
      console.warn("MathJax object not available for typesetting. Ensure it's loaded in index.html.");
    }

    setShowModal(false); // Hide the modal after applying styles
    setCurrentSelectedRootParentTag(null); // Clear the stored element
  };

  const handleUpload = useCallback(() => {
    const result = [];
    let zeroElement = {
      type: "editor",
      content: '',
      is_modified: false
    };

    result.push(zeroElement);

    for (let i = 0; i < serverRes.length; i++) {
      result.push({ type: 'question', content: serverRes[i].content, is_modified: false }); // Add the original element
      zeroElement.content = `<p class="dynamic-action-p" data-file-index="${i}" style="background-color: #007bff; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer;">Insert text here</button>`
      result.push(zeroElement);
    }
    const contentString = result.reduce((acc, ele) => {
      return acc += ele.content
    }, '')
    console.log("result", result)
    setCustomList(result)
    setPreviewContent(contentString)
    return result;
  }, [serverRes])

  const handleClick = () => {
    console.log("clicked")
  }
  console.log("customList", customList)
  return (
    <div style={{ padding: 20 }}>
      <style>
        {`
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
            Insert/Edit Text
          </button>
        </div>

        <h3>Combined Preview</h3>
        {/* <button
          onClick={handlePrint}
        >
          Download Content as PDF
        </button> */}
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
          <div ref={pandocContentRef}>
            {customList.map((ele, index) => {
              return <div  key={index} dangerouslySetInnerHTML={{ __html: ele.content }} /> 
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
              {Array.from({ length: (24 - 12) / 4 + 1 }, (_, i) => 12 + i * 4).map(size => (
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
            <label>Background Color: </label>
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