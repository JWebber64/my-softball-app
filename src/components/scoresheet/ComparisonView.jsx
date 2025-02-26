import React from 'react';

const ComparisonView = ({ originalImage, digitalScoreSheet }) => {
  // Define the heading style directly
  const headingStyle = {
    display: 'inline-block',
    backgroundColor: '#545E46',
    color: '#EFF7EC',
    padding: '8px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontWeight: 'bold',
    fontSize: '24px'
  };

  // Define the empty box style directly
  const emptyBoxStyle = {
    backgroundColor: '#545E46',
    color: '#EFF7EC',
    padding: '16px',
    borderRadius: '8px',
    fontWeight: 'bold'
  };

  return (
    <div style={{ backgroundColor: '#7C866B', width: '100%', padding: '16px' }}>
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
          maxWidth: '1800px',
          margin: '0 auto'
        }}
      >
        {/* Original Image */}
        <div
          style={{
            backgroundColor: '#7C866B',
            borderRadius: '8px',
            padding: '16px',
            minHeight: '226mm',
            width: '100%',
            overflow: 'auto'
          }}
        >
          <div style={headingStyle}>ORIGINAL IMAGE SECTION</div>
          
          {originalImage ? (
            <img 
              src={originalImage} 
              alt="Original Score Sheet" 
              style={{ 
                width: '100%',
                height: 'auto',
                objectFit: 'contain'
              }} 
            />
          ) : (
            <div style={emptyBoxStyle}>No image provided</div>
          )}
        </div>

        {/* Digital Score Sheet */}
        <div
          style={{
            backgroundColor: '#7C866B',
            borderRadius: '8px',
            padding: '16px',
            minHeight: '226mm',
            width: '100%',
            overflow: 'auto'
          }}
        >
          <div style={headingStyle}>DIGITAL SCORESHEET SECTION</div>
          
          <div style={{ padding: '8px' }}>
            {digitalScoreSheet || (
              <div style={emptyBoxStyle}>No digital scoresheet provided</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
