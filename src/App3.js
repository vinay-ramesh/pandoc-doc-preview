import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
// import "./App.css"; // Ensure you import your CSS file
import "./App3.css"; // Ensure you import your CSS file
import axios from "axios";
import EditorModal from "./components/EditorModal/EditorModal";
import StyleModal from "./components/StyleModal/StyleModal";
import PDFPreview from "./components/PDFPreview/PDFPreview";

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

function App() {
    const [customList, setCustomList] = useState([])
    const [selectedIndex, setSelectedIndex] = useState('')
    const [file, setFile] = useState('')
    const targetRef = useRef(null)

    // Modal related states
    const [showModal, setShowModal] = useState(false);
    const [fontSize, setFontSize] = useState("16px"); // Default to 16px as per your reset logic
    const [backgroundColor, setBackgroundColor] = useState("");
    const modalRef = useRef(null);

    // Selection related states
    const previewRef = useRef(null);
    const editorContentRef = useRef(null); // Ref for general editor content
    const contentWrapperRef = useRef(null); // Single ref for all dynamic content
    const [currentSelectedRootParentTag, setCurrentSelectedRootParentTag] = useState(null);
    const [selectionTimeoutId, setSelectionTimeoutId] = useState(null);
    const [selectedFont, setSelectedFont] = useState('Inter');

    const [openModal, setOpenModal] = useState(false)

    const handleOpenCloseModal = useCallback(() => {
        setOpenModal(prev => !prev) // Use functional update for consistent state toggling
    }, []); // No dependencies needed for a simple toggle

    // Font updation (no change, good as is)
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

            if (editorContentRef.current && editorContentRef.current.contains(range.commonAncestorContainer)) {
                setShowModal(false);
                setCurrentSelectedRootParentTag(null);
                setFontSize("16px");
                setBackgroundColor("");
                setSelectedFont("Inter");
                return;
            }

            if (contentWrapperRef.current && contentWrapperRef.current.contains(range.commonAncestorContainer)) {
                let currentElement = range.commonAncestorContainer;
                let rootParentTag = null;
                let selectedDataItemId = null;

                while (currentElement && currentElement !== contentWrapperRef.current) {
                    if (currentElement.parentElement === contentWrapperRef.current) {
                        rootParentTag = currentElement;
                        selectedDataItemId = rootParentTag.dataset.itemId;
                        break;
                    }
                    currentElement = currentElement.parentElement;
                }

                if (rootParentTag && selectedDataItemId) {
                    if (rootParentTag.classList.contains('dynamic-action-p')) {
                        setShowModal(false);
                        setCurrentSelectedRootParentTag(null);
                        setFontSize("16px");
                        setBackgroundColor("");
                        setSelectedFont("Inter");
                        return;
                    }

                    console.log("Selected dynamic content. Root parent:", rootParentTag.tagName, "ID:", selectedDataItemId);
                    setCurrentSelectedRootParentTag(rootParentTag);

                    const selectedItem = customList.find(item => item.id === selectedDataItemId);
                    if (selectedItem && selectedItem.styles) {
                        console.log("selectedItem.styles.fontSize", selectedItem.styles.fontSize);
                        setFontSize(selectedItem.styles.fontSize || "16px");
                        setBackgroundColor(selectedItem.styles.backgroundColor || "");
                        setSelectedFont(selectedItem.styles.fontFamily || "Inter");
                    } else {
                        setFontSize("16px");
                        setBackgroundColor("");
                        setSelectedFont("Inter");
                    }

                    const id = setTimeout(() => {
                        setShowModal(true);
                    }, 1000);
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
    }, [selectionTimeoutId, customList, previewRef, editorContentRef, contentWrapperRef, modalRef]);

    // Apply style to the selected element's corresponding item in customList state
    const applyStyleToSelectedElement = useCallback(() => {
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

        const updatedCustomList = customList.map(item => {
            if (item.id === selectedItemId) {
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

        setCustomList(updatedCustomList);

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
    }, [currentSelectedRootParentTag, customList, fontSize, backgroundColor, selectedFont]);


    const handleUpload = async () => {
        if (!file || file.length === 0) {
            alert("Please select files first!");
            return;
        }

        const formData = new FormData();
        for (let i = 0; i < file.length; i++) {
            formData.append("files", file[i]);
        }

        try {
            const res = await axios.post("http://localhost:5000/upload", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const result = [];
            if (res.data.contents && res.data.contents.length > 0) {
                const localArr = res.data.contents
                result.push({
                    type: "editor",
                    content: '<p>Insert text here</p>',
                    is_modified: false,
                    id: "editor-initial"
                });

                for (let i = 0; i < localArr.length; i++) {
                    const uniqueId = `question-${i}-${Date.now()}`;
                    result.push({
                        type: 'question',
                        rawContent: localArr[i].content,
                        is_modified: false,
                        id: uniqueId,
                        styles: {
                            fontSize: "16px", // Default font size on upload
                            backgroundColor: "",
                            fontFamily: "Inter"
                        }
                    });
                    const editorIndexInList = result.length;
                    result.push({
                        type: 'editor',
                        content: `<p data-action-type="insert-editor" data-list-index="${editorIndexInList}">Insert text here</p>`,
                        is_modified: false,
                        id: `editor-${i}-${Date.now()}` // Fixed template literal for ID
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
            } else {
                result.push({
                    type: "editor",
                    content: '<p>No contents to display</p>',
                    is_modified: false,
                    id: "editor-initial"
                });
                setCustomList(result);
            }
            if (res.data.failed && res.data.failed.length > 0) {
                alert(`Some files failed to convert: ${res.data.failed.map(f => f.filename).join(', ')}. Check console for details.`);
                console.error("Failed conversions:", res.data.failed);
            }
        } catch (err) {
            let result = []
            console.error("Error uploading files or processing conversion", err.response ? err.response.data : err.message);
            result.push({
                type: "editor",
                content: `<p style="color: red;">Error: ${err.response ? err.response.data.error : err.message}</p>`,
                is_modified: false,
                id: "editor-initial"
            });
            setCustomList(result);
        }
    };

    const handleInsertTextClick = useCallback((e) => {
        const target = e.target.closest('.dynamic-action-p[data-action-type="insert-editor"]');
        if (target) {
            const listIndex = target.dataset.listIndex;
            console.log("Clicked editor at customList index:", listIndex);
            setSelectedIndex(listIndex)
            handleOpenCloseModal()
        }
    }, [handleOpenCloseModal]);

    const updatedEditorContent = useCallback((updatedContent) => {
        const contentToReplace = updatedContent.replace(/<\/?p>/g, "")
        setCustomList((prevState) => {
            const newList = [...prevState]
            if (newList[selectedIndex]) {
                newList[selectedIndex] = {
                    ...newList[selectedIndex],
                    content: `<p>${contentToReplace}</p>`, // Ensure paragraph tags are re-added if stripped by editor
                    is_modified: true
                }
            }
            return newList;
        })
    }, [selectedIndex])

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

    const handleFileChange = (e) => {
        setFile(e.target.files);
    };

    const handleResetStyle = useCallback(() => {
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

        const updatedCustomList = customList.map(item => {
            if (item.id === selectedItemId) {
                return {
                    ...item,
                    styles: {
                        fontSize: '16px', // Reset to default
                        backgroundColor: '',
                        fontFamily: 'Inter'
                    },
                    is_modified: true
                };
            }
            return item;
        });

        setCustomList(updatedCustomList);
        // Reset modal states to reflect the default styles
        setFontSize('16px');
        setBackgroundColor('');
        setSelectedFont('Inter');

        setShowModal(false);
        setCurrentSelectedRootParentTag(null);
    }, [currentSelectedRootParentTag, customList]);


    const handleDownloadPDF = async () => {
        const pdfElement = targetRef.current;
        if (!pdfElement) {
            throw new Error('PDF preview element not found');
        }

        if (window.MathJax && window.MathJax.typesetPromise) {
            console.log("Waiting for MathJax to typeset in main window...");
            try {
                await window.MathJax.typesetPromise([pdfElement]);
                console.log("MathJax typesetting complete in main window.");
            } catch (error) {
                console.error("MathJax typesetting failed in main window:", error);
            }
        }

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Apps'n'Devices Technologies Pvt Ltd.</title>
                <meta charset="utf-8">
                ${googleFonts.map(font =>
            `<link href="https://fonts.googleapis.com/css2?family=${font.value}:wght@400;700&display=swap" rel="stylesheet">`
        ).join('\n')}
                
                <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
                <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
                <script>
                    window.MathJax = {
                        tex: {
                            inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                            displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
                        },
                        options: {
                            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
                        }
                    };
                </script>
                
                <style>
                    body {
                        font-family: 'Inter', sans-serif;
                        line-height: 1.6;
                        color: #333;
                        margin: 0;
                        padding: 20px;
                        box-sizing: border-box;
                    }
                    
                    .mathjax-preview {
                        padding: 0;
                        min-height: auto;
                        background-color: #fff;
                        overflow-x: hidden;
                        box-sizing: border-box;
                        border: none;
                    }
    
                    .mathjax-preview table {
                        width: 100%;
                        table-layout: fixed;
                        border-collapse: collapse;
                        margin: 0;
                        overflow-x: auto;
                        display: block;
                        box-sizing: border-box;
                        border: none;
                    }
                                    
                    .mathjax-preview th,
                    .mathjax-preview td {
                        padding: 5px;
                        text-align: left;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                        box-sizing: border-box;
                        border: none;
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
                    .mathjax-preview ul,
                    .mathjax-preview ol,
                    .mathjax-preview li {
                        margin: 0;
                        padding: 0;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                        border: none;
                    }
                    
                    .mjx-chtml {
                        word-wrap: normal;
                        overflow-x: auto;
                        display: block;
                        border: none;
                        min-height: 1em;
                        line-height: 1.2;
                        page-break-inside: avoid;
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
                    
                    /* Styles for the question item container */
                    .question-item-container {
                        display: flex;
                        align-items: baseline;
                        margin-bottom: 15px;
                        page-break-inside: avoid;
                    }
    
                    /* Styles for the question number */
                    .question-number-print {
                        margin-top: 0 !important;
                        margin-bottom: 0 !important;
                        padding: 0 8px 0 0 !important;
                        white-space: nowrap;
                        flex-shrink: 0;
                        font-weight: bold;
                        line-height: inherit;
                    }
    
                    /* Styles for the main question content */
                    .question-content {
                        flex-grow: 1;
                        page-break-inside: auto;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                        margin: 0;
                        padding: 0;
                    }
    
                    .question-content td > math[display="block"],
                    .question-content math[display="block"] {
                        display: flex;
                        align-items: baseline;
                    }
                    
                    .question-content td > p {
                        display: flex;
                    }

                    /* Image resizing for print */
                    .question-content img {
                        max-width: 100%;
                        height: auto;
                        display: block;
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
    
                    @media print {
                        * {
                            /* Removed aggressive overflow: hidden; */
                        }
                        body {
                            margin: 0;
                            padding: 20px;
                        }
                        
                        .page-break-before { page-break-before: always; }
                        .page-break-after { page-break-after: always; }
                        .no-page-break { page-break-inside: avoid; }
    
                        .question-item-container {
                            page-break-inside: avoid;
                            margin-bottom: 20px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="mathjax-preview">
                    ${pdfElement.innerHTML}
                </div>
                
                <script>
                    window.addEventListener('load', function() {
                        if (window.MathJax && window.MathJax.startup) {
                            window.MathJax.startup.promise.then(function() {
                                setTimeout(function() {
                                    window.print();
                                }, 500);
                            });
                        } else {
                            setTimeout(function() {
                                window.print();
                            }, 1000);
                        }
                    });
                    
                    window.addEventListener('afterprint', function() {
                        window.close();
                    });
                </script>
            </body>
            </html>
        `;
        const blob = new Blob([printContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        const printWindow = window.open(url, '_blank');

        if (printWindow) {
            printWindow.onload = () => {
                setTimeout(() => URL.revokeObjectURL(url), 100);
            };
            printWindow.onbeforeunload = () => {
                URL.revokeObjectURL(url);
            };
        } else {
            alert("Please allow pop-ups for this site to print.");
            URL.revokeObjectURL(url);
        }
    };

    const handleFontSize = useCallback((type) => {
        const currentValue = Number(fontSize.slice(0, -2));

        let newFontSizeValue;
        if (type === "down") {
            newFontSizeValue = currentValue - 1;
            if (newFontSizeValue < 12) {
                alert("Cannot go below 12px font-size.");
                return;
            }
        } else if (type === "up") {
            newFontSizeValue = currentValue + 1;
            if (newFontSizeValue > 34) {
                alert("Cannot go beyond 34px font-size.");
                return;
            }
        } else {
            return;
        }

        const updatedFontSize = `${newFontSizeValue}px`;
        setFontSize(updatedFontSize);

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

        const updatedCustomList = customList.map(item => {
            if (item.id === selectedItemId) {
                return {
                    ...item,
                    styles: {
                        ...item.styles,
                        fontSize: updatedFontSize
                    },
                    is_modified: true
                };
            }
            return item;
        });

        setCustomList(updatedCustomList);

        if (window.MathJax && window.MathJax.typesetPromise) {
            setTimeout(() => {
                window.MathJax.typesetPromise([contentWrapperRef.current])
                    .then(() => {
                        console.log("MathJax re-typeset complete after font-size change!");
                    })
                    .catch(err => {
                        console.error("MathJax re-typesetting error:", err);
                    });
            }, 50);
        } else {
            console.warn("MathJax object not available.");
        }
    }, [currentSelectedRootParentTag, customList, fontSize]);

    return (
        <>
            <div style={{ padding: 20 }}>
                <h2>DOCX to HTML with MathML Preview</h2>
                <input type="file" accept=".docx" onChange={handleFileChange} multiple />
                <button onClick={handleUpload} disabled={!file || file.length === 0}>Upload & Preview</button>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div
                        ref={previewRef}
                        className="mathjax-preview"
                    >
                        <div ref={contentWrapperRef}>
                            {customList?.length > 0 && customList?.map((ele, index) => {
                                if (ele.type === 'question') {
                                    const questionNumber = customList.slice(0, index).filter(item => item.type === 'question').length + 1;

                                    return (
                                        <div
                                            key={ele.id} // Key should be on the outermost element
                                            data-item-id={ele.id} // Attach data-item-id here for root parent selection
                                            className="question-item-container" // New class for better targeting
                                        // No inline style here, as question-content handles its own styles
                                        >
                                            <p className="question-number">{`${questionNumber}. `}</p>
                                            <div
                                                className="question-content"
                                                style={{
                                                    fontSize: ele.styles?.fontSize, // Use optional chaining for safety
                                                    backgroundColor: ele.styles?.backgroundColor,
                                                    fontFamily: `${ele.styles?.fontFamily}, sans-serif`,
                                                }}
                                                dangerouslySetInnerHTML={{ __html: ele.rawContent }}
                                            />
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div
                                            key={ele.id}
                                            className="dynamic-editor-slot" // Renamed class for clarity
                                            data-action-type="insert-editor"
                                            data-list-index={index}
                                            dangerouslySetInnerHTML={{ __html: ele.content }}
                                        />
                                    );
                                }
                            })}
                        </div>
                    </div>
                    <PDFPreview targetRef={targetRef} customList={customList} />
                </div>
                <button onClick={handleDownloadPDF}>Download PDF</button>
                {showModal && (
                    <StyleModal
                        modalRef={modalRef}
                        fontSize={fontSize}
                        setFontSize={setFontSize}
                        backgroundColor={backgroundColor}
                        setBackgroundColor={setBackgroundColor}
                        selectedFont={selectedFont}
                        setSelectedFont={setSelectedFont}
                        googleFonts={googleFonts}
                        applyStyleToSelectedElement={applyStyleToSelectedElement}
                        setShowModal={setShowModal}
                        setCurrentSelectedRootParentTag={setCurrentSelectedRootParentTag}
                        handleResetStyle={handleResetStyle}
                        handleFontSize={handleFontSize}
                    />
                )}
            </div>
            {openModal &&
                <EditorModal
                    openModal={openModal}
                    handleOpenCloseModal={handleOpenCloseModal}
                    initialContent={customList[selectedIndex]?.content?.replace(/<p[^>]*>(.*?)<\/p>/, '$1')}
                    updatedEditorContent={updatedEditorContent}
                />
            }
        </>
    );
}

export default App;