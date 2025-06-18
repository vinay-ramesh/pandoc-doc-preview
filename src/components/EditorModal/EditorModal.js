import React, { useState, useRef, useEffect, useCallback } from 'react';
import RichTextEditor from '../../RichTextEditor';

const EditorModal = (props) => {
    const { handleOpenCloseModal, initialContent, updatedEditorContent } = props;
    const [editorContent, setEditorContent] = useState(initialContent || "")

    const handleInternalSave = () => {
        updatedEditorContent(editorContent)
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
                style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    minWidth: '300px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
            >
                <RichTextEditor initialValue={editorContent} onChange={setEditorContent} />
                <button onClick={handleInternalSave}>
                    Save
                </button>
                <button onClick={handleOpenCloseModal}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default EditorModal;