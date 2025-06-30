import up from '../../assets/A_up.svg'
import down from '../../assets/A_down.svg'

const StyleModal = (props) => {
    const { modalRef, fontSize, backgroundColor, setBackgroundColor, selectedFont, setSelectedFont, googleFonts, applyStyleToSelectedElement, setShowModal, setCurrentSelectedRootParentTag, handleResetStyle, handleFontSize } = props

    return (
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
            <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                <label style={{ verticalAlign: "middle" }}>Font Size: {fontSize}</label>
                {/* <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
                    {Array.from({ length: (24 - 12) / 4 + 1 }, (_, i) => 12 + i * 4).map(size => (
                        <option key={size} value={`${size}px`}>{size}px</option>
                    ))}
                </select> */}
                <div style={{ width: "60%", display: "flex", justifyContent: "space-between" }}>
                    <img src={up} alt='increase-font-size' style={{ padding: "5px", border: "1px solid", textAlign: "center", scale: "1", cursor: "pointer" }} onClick={() => handleFontSize('up')} />
                    <img src={down} alt='decrease-font-size' style={{ padding: "5px", border: "1px solid", textAlign: "center", scale: "1", cursor: "pointer" }} onClick={() => handleFontSize('down')} />
                </div>

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
    )
}

export default StyleModal