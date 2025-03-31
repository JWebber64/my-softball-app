# ⚠️ CRITICAL COLOR SYSTEM REQUIREMENTS
NEVER use Chakra's built-in colors or colorScheme prop. 
ALL colors MUST come from:
- src/styles/tokens.css (CSS variables)
- src/styles/base.css (global styles)
- src/theme/theme.js (Chakra theme configuration)

NO EXCEPTIONS. Check these files first for ALL color-related code.

---

# ⚠️ CRITICAL RLS AND DATABASE REQUIREMENTS
ALWAYS check ReadMeRLS.md FIRST for ANY database-related code.
MUST follow these requirements WITHOUT EXCEPTION:
1. Drop policies in correct order
2. Use ONLY existing security definer functions
3. Follow exact migration order
4. Use standardized policy naming
NO CUSTOM SECURITY FUNCTIONS - use existing ones from ReadMeRLS.md

---

# Code Response Guidelines

## ALWAYS CHECK BEFORE PROVIDING CODE:

1. ESLint Requirements
   - PropTypes are REQUIRED for all React components
   - All props must be properly typed
   - No unused variables allowed
   - React in scope is not required
   - VERIFY ALL VARIABLES AND IMPORTS ARE USED
   - Remove any unused declarations
   - Check for unused props
   - Remove unused function parameters
   - EVERY import must be included in code snippets
   - ALL referenced components/variables must be imported
   - ALL destructured values must be imported from their source
   - ALL hooks and context values must be properly imported
   - ALL functions called within components must be defined or imported
   - CHECK FOR ALIASED IMPORTS (e.g., fetchTeamDetails as fetchTeamInfo)

2. Import Requirements
   - ALL imports must be included at the top of the file
   - NO partial import sections
   - Include ALL required Chakra UI components
   - Include ALL required React hooks
   - Include ALL custom components and utilities
   - Include ALL PropTypes
   - NO assumptions about existing imports
   - VERIFY ALL destructured values from hooks/context
   - CHECK FOR RENAMED/ALIASED imports

3. Function and Variable Requirements
   - ALL functions called within components must be defined or imported
   - ALL context values must be properly imported and destructured
   - ALL hook return values must be properly destructured
   - NO undefined function calls
   - NO undefined variables
   - ALL callback functions must be properly defined
   - ALL event handlers must be properly defined

4. Before Responding
   - Check error messages if provided
   - Review project configuration files
   - Verify solution meets ESLint rules
   - Ensure all props are properly typed
   - REMOVE ALL UNUSED VARIABLES AND IMPORTS
   - TEST EVERY LINE IS ACTUALLY USED
   - VERIFY ALL IMPORTS ARE INCLUDED
   - RUN ESLINT VERIFICATION
   - CHECK FOR UNDEFINED FUNCTIONS
   - VERIFY ALL DESTRUCTURED VALUES

5. Common Project Requirements
   - React 18.2.0
   - Chakra UI components
   - PropTypes validation
   - ES6+ syntax
   - Zero unused code

## DO NOT:
- Provide partial solutions
- Ignore error messages
- Make assumptions about configuration
- Skip prop type definitions
- Introduce new patterns without explanation
- Omit necessary imports
- Provide incomplete import sections

## ALWAYS:
- Include ALL necessary imports
- Check against ESLint configuration
- Provide complete, working solutions
- Include all necessary imports and type definitions
- Verify all variables are defined
- Include all required Chakra components




