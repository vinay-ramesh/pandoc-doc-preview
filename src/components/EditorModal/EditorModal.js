// /* eslint-disable react-hooks/exhaustive-deps */
// import React, { useState, useRef, useEffect, useCallback } from 'react';

// const EditorModal = (props) => {
//     const { openEditorModal, handleModalOpenClose } = props

//     // const [modalIsOpen, setModalIsOpen] = useState(false);
//     const [editorContent, setEditorContent] = useState(''); // State to hold editor content
//     const modalRef = useRef(null); // Ref for the modal element

//     const modalOpenClose = () => {
//         // setModalIsOpen(!modalIsOpen);
//         handleModalOpenClose();
//     };

//     const handleSave = () => {
//         console.log('Saving content:', editorContent);
//         modalOpenClose()
//         // setModalIsOpen(!modalIsOpen);
//     };

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (modalRef.current && !modalRef.current.contains(event.target)) {
//                 modalOpenClose();
//             }
//         };

//         // Add event listener when modal is open
//         if (openEditorModal) {
//             document.addEventListener('mousedown', handleClickOutside);
//         }

//         // Clean up the event listener when modal closes or component unmounts
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [openEditorModal]); // Re-run effect when openEditorModal changes

//     console.log("openEditorModal in child", {openEditorModal})
//     return (
//         <div>
//             {openEditorModal && (
//                 <div
//                     style={{
//                         position: 'fixed',
//                         top: 0,
//                         left: 0,
//                         width: '100%',
//                         height: '100%',
//                         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//                         display: 'flex',
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                         zIndex: 1000,
//                     }}
//                 >
//                     <div
//                         ref={modalRef} // Attach ref to the modal content div
//                         style={{
//                             backgroundColor: 'white',
//                             padding: '20px',
//                             borderRadius: '8px',
//                             minWidth: '300px',
//                             boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//                         }}
//                     >
//                         <h2>Modal Title</h2>
//                         <textarea
//                             value={editorContent}
//                             onChange={(e) => setEditorContent(e.target.value)}
//                             placeholder="Type your content here..."
//                             style={{ width: '100%', minHeight: '100px', marginBottom: '15px', padding: '8px' }}
//                         />
//                         <div>
//                             <button onClick={modalOpenClose} style={{ marginRight: '10px' }}>
//                                 Close
//                             </button>
//                             <button onClick={handleSave}>Save</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default EditorModal;

/* eslint-disable react-hooks/exhaustive-deps */
// import React, { useState, useRef, useEffect } from 'react';

// const EditorModal = (props) => {
//     const { openEditorModal, handleModalOpenClose } = props;

//     const [editorContent, setEditorContent] = useState(''); // State to hold editor content
//     const modalRef = useRef(null); // Ref for the modal element

//     const handleSave = () => {
//         console.log('Saving content:', editorContent);
//         // You would typically pass this content back to the parent component
//         // For example: props.onSave(editorContent);
//         handleModalOpenClose(); // Close the modal after saving
//     };

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             // Close modal if click is outside the modal content and modal is open
//             if (modalRef.current && !modalRef.current.contains(event.target) && openEditorModal) {
//                 handleModalOpenClose();
//             }
//         };

//         // Add event listener when modal is open
//         if (openEditorModal) {
//             document.addEventListener('mousedown', handleClickOutside);
//         }

//         // Clean up the event listener when modal closes or component unmounts
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [openEditorModal, handleModalOpenClose]); // Re-run effect when openEditorModal or handleModalOpenClose changes

//     console.log("openEditorModal in child", { openEditorModal });

//     if (!openEditorModal) {
//         return null; // Don't render anything if the modal is not open
//     }

//     return (
//         <div
//             style={{
//                 position: 'fixed',
//                 top: 0,
//                 left: 0,
//                 width: '100%',
//                 height: '100%',
//                 backgroundColor: 'rgba(0, 0, 0, 0.5)',
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 zIndex: 1000,
//             }}
//         >
//             <div
//                 ref={modalRef} // Attach ref to the modal content div
//                 style={{
//                     backgroundColor: 'white',
//                     padding: '20px',
//                     borderRadius: '8px',
//                     minWidth: '300px',
//                     boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//                 }}
//             >
//                 <h2>Modal Title</h2>
//                 <textarea
//                     value={editorContent}
//                     onChange={(e) => setEditorContent(e.target.value)}
//                     placeholder="Type your content here..."
//                     style={{ width: '100%', minHeight: '100px', marginBottom: '15px', padding: '8px' }}
//                 />
//                 <div>
//                     <button onClick={handleModalOpenClose} style={{ marginRight: '10px' }}>
//                         Close
//                     </button>
//                     <button onClick={handleSave}>Save</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default EditorModal;

// V3
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect, useCallback } from 'react';

const EditorModal = (props) => {
    const { openEditorModal, handleModalOpenClose, initialContent, onSave } = props;

    // Internal state for the textarea content
    const [editorContent, setEditorContent] = useState('');
    const modalRef = useRef(null);

    // Effect to update internal editorContent when initialContent prop changes
    // This is crucial to ensure the modal displays the correct content
    useEffect(() => {
        if (openEditorModal) {
            setEditorContent(initialContent);
        }
    }, [openEditorModal, initialContent]); // Re-run when modal opens or initialContent changes

    const handleInternalSave = () => {
        onSave(editorContent); // Pass the current internal editorContent back to parent
        // handleModalOpenClose(); // The parent will close it via onSave's logic
    };

    const handleInternalClose = () => {
        handleModalOpenClose(); // Simply close the modal
    };

    // Use useCallback for handleClickOutside to stabilize it
    const handleClickOutside = useCallback((event) => {
        if (modalRef.current && !modalRef.current.contains(event.target) && openEditorModal) {
            handleModalOpenClose();
        }
    }, [openEditorModal, handleModalOpenClose]); // Dependencies

    useEffect(() => {
        if (openEditorModal) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            // Ensure cleanup even if openEditorModal becomes false without manual interaction
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openEditorModal, handleClickOutside]); // Dependency on handleClickOutside

    console.log("EditorModal: openEditorModal", openEditorModal, "initialContent set to", initialContent ? initialContent.substring(0, 50) + '...' : 'null');

    if (!openEditorModal) {
        return null; // Don't render anything if the modal is not open
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
            }}
        >
            <div
                ref={modalRef}
                style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    minWidth: '300px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
            >
                <h2>Edit Content</h2>
                <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    placeholder="Type your content here..."
                    style={{ width: '100%', minHeight: '100px', marginBottom: '15px', padding: '8px' }}
                />
                <div>
                    <button onClick={handleInternalClose} style={{ marginRight: '10px' }}>
                        Close
                    </button>
                    <button onClick={handleInternalSave}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default EditorModal;