
const PDFPreview = (props) => {
    const { targetRef, customList } = props

  return (
      <div style={{ background: '#fff', height: "100%" }} id="mathjax-preview-pdf" className="mathjax-preview" ref={targetRef}>
          {customList?.length > 0 && customList?.map((ele, index) => {
              if (ele.type === 'question') {
                  const questionNumber = customList.slice(0, index).filter(item => item.type === 'question').length + 1;
                  return (
                      <div style={{ display: "flex", alignItems: "flex-start" }} key={ele.id} data-item-id={ele.id}>
                          <p style={{ marginTop: '16px', whiteSpace: "nowrap", padding: "5px" }}>{`${questionNumber}. `}</p>
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
                  return (
                      <div
                          style={{ margin: '10px 0px' }}
                          key={ele.id}
                          className="dynamic-action-p"
                          data-action-type="insert-editor"
                          data-list-index={index}
                          dangerouslySetInnerHTML={{ __html: ele.content }}
                      />
                  );
              } return null
          })}
      </div>
  )
}

export default PDFPreview