import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import { dummyResponse } from "./dummyResponse"
import axios from "axios";
import EditorModal from "./components/EditorModal/EditorModal";
import { usePDF } from 'react-to-pdf';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function App() {
    const [customList, setCustomList] = useState([])
    const [serverRes, setServerRes] = useState(dummyResponse)
    const [selectedIndex, setSelectedIndex] = useState('')
    const [file, setFile] = useState('')
    const { toPDF, targetRef } = usePDF({ filename: 'page.pdf' });

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

    const [openModal, setOpenModal] = useState(false)

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

    const handleOpenCloseModal = useCallback(() => {
        setOpenModal(!openModal)
    }, [openModal])

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
                            fontSize: "16px",
                            backgroundColor: "",
                            fontFamily: "Inter"
                        }
                    });
                    const editorIndexInList = result.length;
                    result.push({
                        type: 'editor',
                        content: `<p data-action-type="insert-editor" data-list-index="${editorIndexInList}">Insert text here</p>`,
                        is_modified: false,
                        id: `editor-<span class="math-inline">${i}</span>{Date.now()}`
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
                    id: "editor-initial" // Unique ID for general editor slot
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
                id: "editor-initial" // Unique ID for general editor slot
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
                    // content: `<p class="dynamic-action-p" data-action-type="insert-editor" data-list-index=${selectedIndex}>${contentToReplace}</p>`,
                    content: `<p>${contentToReplace}</p>`,
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
        setFile(e.target.files); // Store FileList for multiple files
    };

    const handleResetStyle = () => {
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
                        fontSize: '16px',
                        backgroundColor: '',
                        fontFamily: 'Inter'
                    },
                    is_modified: true
                };
            }
            return item;
        });

        setCustomList(updatedCustomList); // This re-renders the component with new styles

        setShowModal(false);
        setCurrentSelectedRootParentTag(null);
    }

    const handleDownloadPDF = async () => {
        // const input = document.getElementById('mathjax-preview-pdf');
        // const canvas = await html2canvas(input);
        // const imgData = canvas.toDataURL('image/png');

        // const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for units, 'a4' for page size
        // const imgWidth = 210; // A4 width in mm
        // const pageHeight = 297; // A4 height in mm
        // const imgHeight = (canvas.height * imgWidth) / canvas.width;
        // let heightLeft = imgHeight;

        // let position = 0;

        // pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        // heightLeft -= pageHeight;

        // while (heightLeft >= 0) {
        //     position = heightLeft - imgHeight;
        //     pdf.addPage();
        //     pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        //     heightLeft -= pageHeight;
        // }

        // pdf.save('document.pdf');
        console.log("I am there")
    }

    return (
        <>
            <div style={{ padding: 20 }}>

                <h2>DOCX to HTML with MathML Preview</h2>

                <input type="file" accept=".docx" onChange={handleFileChange} multiple /> {/* Added 'multiple' */}
                <button onClick={handleUpload} disabled={!file || file.length === 0}>Upload & Preview</button>
                {/* <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "auto" }}> */}
                    {/* <div style={{ width: '50%' }}> */}
                        {/* <h3>Combined Preview</h3> */}
                        <div
                            ref={previewRef}
                            className="mathjax-preview"
                            style={{
                                // border: "1px solid #ccc",
                                padding: "15px",
                                minHeight: "200px",
                                backgroundColor: "#fff",
                                overflowX: 'auto'
                            }}
                        >
                            <div ref={contentWrapperRef}>
                                {customList?.length > 0 && customList?.map((ele, index) => {

                                    if (ele.type === 'question') {
                                        const questionNumber = customList.slice(0, index).filter(item => item.type === 'question').length + 1;

                                        return (
                                            <div style={{ display: "flex", alignItems: "flex-start" }} key={ele.id} data-item-id={ele.id}>
                                                <div style={{ marginRight: '10px', whiteSpace: "nowrap" }}>{`${questionNumber}. `}</div>
                                                <div
                                                    key={ele.id}
                                                    data-item-id={ele.id}
                                                    className="question-content"
                                                    style={{
                                                        fontSize: ele.styles.fontSize,
                                                        backgroundColor: ele.styles.backgroundColor,
                                                        fontFamily: `${ele.styles.fontFamily}, sans-serif`,
                                                        flexGrow: 1,
                                                        // border: "1px solid"
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: ele.rawContent }}
                                                />
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div
                                                style={{ border: '1px dotted black', width: "100%", margin: '10px 0px', overflow: "auto" }}
                                                key={ele.id}
                                                className="dynamic-action-p"
                                                data-action-type="insert-editor"
                                                data-list-index={index}
                                                dangerouslySetInnerHTML={{ __html: ele.content }}
                                            />
                                        );
                                    }
                                })}
                            </div>
                        </div>
                    {/* </div> */}
                    {/* PDF preview part */}
                    {/* <div style={{ background: '#fff', height: "100%", width: "50%" }} id="mathjax-preview-pdf" className="mathjax-preview" ref={targetRef}>
                        {customList?.length > 0 && customList?.map((ele, index) => {
                            if (ele.type === 'question') {
                                const questionNumber = customList.slice(0, index).filter(item => item.type === 'question').length + 1;
                                return (
                                    <div style={{ display: "flex", alignItems: "flex-start" }} key={ele.id} data-item-id={ele.id}>
                                        <div style={{ marginRight: '10px', whiteSpace: "nowrap" }}>{`${questionNumber}. `}</div>
                                        <div
                                            key={ele.id}
                                            data-item-id={ele.id}
                                            className="question-content"
                                            style={{
                                                fontSize: ele.styles.fontSize,
                                                backgroundColor: ele.styles.backgroundColor,
                                                fontFamily: `${ele.styles.fontFamily}, sans-serif`,
                                                flexGrow: 1,
                                                // border: "1px solid"
                                            }}
                                            dangerouslySetInnerHTML={{ __html: ele.rawContent }}
                                        />
                                    </div>
                                );
                            } else if (ele.type === 'editor' && ele.is_modified) {
                                // } else if (ele.type === 'editor' && ele.content.includes(`Insert text here`)) {
                                return (
                                    <div
                                        style={{ width: "100%", margin: '10px 0px', overflow: "auto" }}
                                        key={ele.id}
                                        className="dynamic-action-p"
                                        data-action-type="insert-editor"
                                        data-list-index={index}
                                        dangerouslySetInnerHTML={{ __html: ele.content }}
                                    />
                                );
                            } return null
                        })}
                    </div> */}
                {/* </div> */}
                <button onClick={handleDownloadPDF}>Download PDF</button>
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
                        <button onClick={handleResetStyle}>Reset style</button>
                    </div>
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