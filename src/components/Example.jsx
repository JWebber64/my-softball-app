import React from 'react';
import CardContainer from './common/CardContainer'; // Remove curly braces
import Text from './common/Text'; // Remove curly braces

const Example = () => {
  return (
    <CardContainer variant="default">
      {/* 'h1' is not a valid variant based on your Text component */}
      <Text textStyle="h1">Main Title</Text>
      
      <Text variant="body">
        Regular body text with consistent styling
      </Text>
      
      <Text variant="error">
        Error message with consistent color and style
      </Text>
      
      <Text variant="caption">
        Small caption text with muted color
      </Text>
    </CardContainer>
  );
};

export default Example;