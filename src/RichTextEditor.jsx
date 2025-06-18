import React, { useState, useRef, useMemo } from 'react';
import JoditEditor from 'jodit-react';

const RichTextEditor = ({ initialValue = '', onChange, placeholder }) => {
    const editor = useRef(null);
    const [content, setContent] = useState(initialValue);

    //   const config = {
    //     readonly: false, // Enable editing
    //     placeholder: 'Start typing...',
    //     height: 400,
    //     toolbarSticky: false,
    //     showXPathInStatusbar: false,
    //     uploader: {
    //       insertImageAsBase64URI: true, // Allows images to be inserted as base64
    //     },
    //     buttons: [
    //       'source',
    //       '|',
    //       'bold',
    //       'italic',
    //       'underline',
    //       'strikethrough',
    //       '|',
    //       'superscript',
    //       'subscript',
    //       '|',
    //       'ul',
    //       'ol',
    //       '|',
    //       'outdent',
    //       'indent',
    //       '|',
    //       'font',
    //       'fontsize',
    //       'brush',
    //       'paragraph',
    //       '|',
    //       'image',
    //       'table',
    //       'link',
    //       '|',
    //       'align',
    //       'undo',
    //       'redo',
    //       '|',
    //       'hr',
    //       'eraser',
    //       'copyformat',
    //       '|',
    //       'fullsize',
    //       'print',
    //       'about',
    //     ],
    //   };

    const handlePaste = (event) => {
        const clipboardData = event.clipboardData;
        const items = clipboardData?.items;

        if (items) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') === 0) {
                    const file = items[i].getAsFile();
                    const reader = new FileReader();

                    reader.onload = (e) => {
                        const base64Image = e.target?.result;
                        console.log('base64Image', base64Image);
                        setContent((prevContent) => prevContent + `<img src="${base64Image}" alt="Pasted Image"/>`);
                    };

                    if (file) {
                        reader.readAsDataURL(file);
                    }
                }
            }
        }
    };

    const config = useMemo(
        () => ({
            height: 400,
            readonly: false, // all options from https://xdsoft.net/jodit/docs/,
            placeholder: placeholder || 'Start typing...',
            uploader: {
                insertImageAsBase64URI: true, // Allows images to be inserted as base64
            },
            events: {
                // beforePaste: handlePaste,
                paste: function (event) {
                    // Handle paste event to preserve formatting
                    const clipboardData = event.clipboardData || window.clipboardData;
                    if (clipboardData && clipboardData.items) {
                        for (let i = 0; i < clipboardData.items.length; i++) {
                            if (clipboardData.items[i].type.indexOf('image') !== -1) {
                                const blob = clipboardData.items[i].getAsFile();
                                const reader = new FileReader();
                                reader.onload = function (e) {
                                    const base64 = e.target.result;
                                    editor.current.selection.insertImage(base64, null, 250); // Insert image with a width of 250px
                                };
                                reader.readAsDataURL(blob);
                                event.preventDefault();
                            }
                        }
                    }
                },
            },
        }),
        [placeholder],
    );

    return (
        <div className="border border-black h-auto p-1 overflow-auto">
            <JoditEditor
                ref={editor}
                value={content}
                config={config}
                onBlur={(newContent) => {
                    setContent(newContent);
                    onChange && onChange(newContent);
                }}
                onChange={(newContent) => setContent(newContent)}
            />
        </div>
    );
};

export default RichTextEditor;
