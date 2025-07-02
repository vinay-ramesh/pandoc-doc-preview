const FontSizeControl = (props) => {
    const { fontSize, handleFontSizeChange } = props
    const handleIncrease = () => {
        const currentSize = parseFloat(fontSize);
        const newSize = `${currentSize + 2}px`;
        handleFontSizeChange(newSize);
    };

    const handleDecrease = () => {
        const currentSize = parseFloat(fontSize);
        const newSize = `${Math.max(currentSize - 2, 8)}px`; // Minimum 8px
        handleFontSizeChange(newSize);
    };

    return (
        <div className="font-size-controls">
            <button onClick={handleDecrease}>A-</button>
            <span>{fontSize}</span>
            <button onClick={handleIncrease}>A+</button>
        </div>
    );
};

export default FontSizeControl