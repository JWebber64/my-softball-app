# Scoresheet Layout Reference

## Component Structure
```jsx
<Box sx={sheetContainerStyles}>
  {/* Left side - Original Image */}
  <Box sx={sheetStyles}>
    <Heading size="md" mb={4} textAlign="center">Uploaded Score Sheet</Heading>
    <Image />
  </Box>

  {/* Right side - Digital Score Sheet */}
  <Box sx={sheetStyles}>
    <Heading size="md" mb={4} textAlign="center">Digital Score Sheet</Heading>
    <DigitalScoreSheet />
  </Box>
</Box>
```

## Key Styles

### Container Styles
```javascript
const sheetContainerStyles = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '2rem',
  width: '100%',
  maxWidth: '1800px',
  margin: '0 auto',
  padding: '1rem'
};

const sheetStyles = {
  width: '100%',
  maxHeight: '80vh',
  overflow: 'auto',
  padding: '1rem',
  borderRadius: '8px',
  backgroundColor: 'white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};
```

### Inning Cell Layout
```javascript
<div className="flex w-full h-full items-center" style={{ gap: "0.75rem" }}>
  {/* Diamond */}
  <div
    className="relative self-center ml-1"
    style={{ 
      width: "1.5rem",
      height: "1.5rem",
      transform: "rotate(45deg)",
      border: "1px solid black"
    }}
  />
  
  {/* Input Fields */}
  <div className="flex flex-col space-y-2" style={{ width: "3.5rem" }}>
    <input /> {/* Event */}
    <input /> {/* Out */}
    <input /> {/* Note */}
  </div>
</div>
```

### Table Structure
- Player column: `w-24`
- Inning columns: `w-36` (9rem)
- Cell padding: `p-2`
- Ordinal numbers for innings (1st, 2nd, 3rd, etc.)

## Important Measurements
- Diamond size: 1.5rem × 1.5rem
- Input field width: 3.5rem
- Gap between diamond and fields: 0.75rem
- Cell padding: 0.5rem
- Total cell width: 9rem

## Color Reference
- Background: #7c866b
- Card/Button Background: #545e46
- Text: #c0fad0, #E7F8E8

## Version History
- v1.0: Initial layout with centered headings, left-aligned diamond