import React, { useState, useRef, useEffect, useCallback } from 'react';

const EditorModal = (props) => {
    const { handleOpenCloseModal, initialContent } = props;
    const [editorContent, setEditorContent] = useState(initialContent || "")

    const handleInternalClose = () => {
        handleOpenCloseModal()
    }

    const handleInternalSave = () => {
        console.log("internalContent", editorContent)
        handleOpenCloseModal()
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
                // ref={modalRef}
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