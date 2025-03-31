# Project Router Configuration

## ⚠️ CRITICAL: Component Props Configuration

### Default Props in Function Components

DO NOT USE the deprecated `defaultProps` pattern for function components. Instead, use JavaScript default parameters.

Reasons:
- `defaultProps` will be removed from function components in a future React version
- Default parameters are more intuitive and align with modern JavaScript
- Improves code readability and maintainability
- Prevents React warnings in the console

Example:
```jsx
// ❌ Wrong - Don't use defaultProps
const MyComponent = ({ size }) => {
  return <div>{size}</div>;
};
MyComponent.defaultProps = {
  size: 'medium'
};

// ✅ Correct - Use default parameters
const MyComponent = ({ size = 'medium' }) => {
  return <div>{size}</div>;
};
```

When using TypeScript or PropTypes:
```jsx
// With PropTypes
const MyComponent = ({ size = 'medium' }) => {
  return <div>{size}</div>;
};

MyComponent.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};

// With TypeScript
type Props = {
  size?: 'small' | 'medium' | 'large';
};

const MyComponent = ({ size = 'medium' }: Props) => {
  return <div>{size}</div>;
};
```

## ⚠️ CRITICAL: Conditional Rendering Policy

DO NOT USE conditional rendering in components. All UI elements should always be visible.

Reasons:
- Maintains consistent layout and prevents UI shifts
- Simplifies component logic
- Improves predictability of UI state
- Prevents unnecessary mounting/unmounting

Instead of conditional rendering:
- Use the `isDisabled` prop to control interactivity
- Show empty states within components
- Handle loading states within components
- Use placeholder content when data is not available

Example:
```jsx
// ❌ Wrong - Don't use conditional rendering
return isLoading ? <Spinner /> : <Component />;

// ✅ Correct - Always render, use props to control state
return <Component isDisabled={isLoading} />;
```

## Recent Supabase Database Changes (March 2024)

⚠️ IMPORTANT: Database Schema Updates

The following major changes have been implemented:

1. Score Sheets Enhancement
   - New table: `score_sheets` with enhanced fields for game statistics
   - Support for both image uploads and digital data entry
   - OCR and voice recognition processing flags
   - Automatic stats calculation capabilities

2. Storage Buckets Configuration
   - `scoresheets`: Game score sheet images (score sheet photos and digital copies)
   - `players`: Player photos and documents
   - `team-logos`: Team logo images
   - `team-assets`: Team-related media files

3. Team Password Protection
   - Added `score_sheet_password` to teams table
   - Enhanced security for viewing score sheets

### Recent Changes

- Enhanced RLS policies with security definer functions for better performance
- Updated team membership checks to use optimized direct access
- Fixed recursive policy issues in team members table

### Required Actions After Pull

After pulling these changes, execute the following steps:

1. Apply Database Migrations:
   ```bash
   # Run in order:
   supabase migration up 01_enable_extensions.sql
   supabase migration up 02_create_schemas.sql
   supabase migration up 03_create_tables.sql
   supabase migration up 04_storage_policies.sql
   supabase migration up 05_rls_policies.sql
   ```

2. Verify RLS Policies:
   - Check team member access is working correctly
   - Verify team admin permissions are properly enforced
   - Test team roster management functionality

3. Monitor Performance:
   - Watch for any unexpected behavior in team member queries
   - Report any issues with policy enforcement

## Database Standards

### Column Naming Standards

⚠️ CRITICAL: For consistent database queries and relationships, use these standardized column names:

| Table           | User ID Column Name     | Notes |
|----------------|------------------------|-------|
| active_role    | active_role_user_id   | Required for role management |
| user_roles     | role_user_id          | Links users to roles |
| user_settings  | settings_user_id      | User preferences |
| team_members   | team_members_user_id  | Team roster management |
| team_admins    | admin_user_id         | Team administration |
| player_profiles| profile_user_id       | Player information |

Always use these exact column names when:
- Creating new tables that reference users
- Writing queries that join with user-related tables
- Implementing RLS policies
- Creating database functions

### Storage Standards

To reference storage buckets in code, always use the constants from `src/constants/storage.js`:

```javascript
import { STORAGE_BUCKETS } from '../constants/storage.js';

// Example usage:
const logoUrl = await uploadStorageFile(STORAGE_BUCKETS.TEAM_LOGOS, fileName, file);
```

⚠️ CRITICAL: Never use bucket names directly in code. Always reference them through the STORAGE_BUCKETS constant.

## Score Sheets Implementation

Score sheets can be managed in two ways:
1. Photo Upload: Team admins can upload actual score sheet photos
2. Digital Entry: Stats can be entered manually or via OCR/voice recognition

All score sheets (both photo and digital) will:
- Be stored in the `scoresheets` bucket
- Require team password for viewing
- Automatically populate team stats
- Be available in the score sheet viewer

Stats will automatically calculate and display:
- Team record
- Team stats
- Player stats
- Recent trends (countable)
- Recent trends (decimal numbers)

## Important Component Export Guidelines

⚠️ CRITICAL: Fast Refresh Compatibility Requirements

To ensure Vite's Fast Refresh works correctly, follow these export rules:
- Use default exports for React components
- Keep context creation and providers separate
- Follow this pattern for context:

```jsx
// ✅ Correct pattern
export const MyContext = createContext(null);
export default function MyProvider({ children }) { ... }

// ❌ Incorrect patterns
export const MyProvider = ({ children }) => { ... }
export { MyProvider }
```

Example for context setup:
```jsx
// context/AuthContext.jsx
export const AuthContext = createContext(null);
export default function AuthProvider({ children }) { ... }

// hooks/useAuth.js
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

Common Fast Refresh Error:
```
Could not Fast Refresh (component export is incompatible)
```
This usually means you're using named exports instead of default exports for components.

# SQL Execution Guidelines

## ⚠️ Critical SQL Implementation Notes

When providing SQL instructions, ALWAYS specify the execution environment:

1. For Supabase Dashboard SQL Editor:
   - Prefix with: "Execute in Supabase Dashboard SQL Editor:"
   - Include steps to navigate to SQL Editor
   - Mention if changes should be committed

2. For Local Development (VS Code):
   - Prefix with: "Create/Update in VS Code:"
   - Specify full file path
   - Include any CLI commands needed

3. For Migration Files:
   - Prefix with: "Create Migration File in VS Code:"
   - Specify complete file path with timestamp
   - Include migration execution commands

Example format:
```sql
-- Execute in Supabase Dashboard SQL Editor:
-- 1. Navigate to https://app.supabase.com
-- 2. Select your project
-- 3. Go to SQL Editor
-- 4. Create New Query
-- 5. Execute the following:

CREATE TABLE example ...
```

### Common Supabase Query Issues

#### Ambiguous Column References

#### 406 Not Acceptable Errors with Foreign Tables

If you encounter a 406 (Not Acceptable) error when querying related tables, check your query syntax:

❌ Incorrect syntax (will cause 406 error):
```js
.select(`
  team_id,
  role,
  team:team_id(*)  // Wrong - old syntax
`)
.single()
```

✅ Correct syntax:
```js
.select(`
  team_id,
  role,
  teams!inner (*)  // Correct - use table name and !inner join
`)
.maybeSingle()  // Use maybeSingle() if result might not exist
```

Key points to fix 406 errors:
1. Use the actual table name (e.g., `teams` not `team`)
2. Use `!inner` for inner joins
3. Use `maybeSingle()` instead of `single()` when results are optional
4. Ensure proper spacing in the select string
5. Use parentheses `()` not curly braces `{}` for nested selects

Common error URL pattern to look for:
```
team:team_id(*) in URL = Wrong syntax
teams!inner(*) in URL = Correct syntax
```

## ⚠️ Critical Auth Context Implementation Notes

When implementing authentication across components:
1. NEVER import AuthContext directly in components
2. ALWAYS use the useAuth hook:
```jsx
// ✅ Correct
import { useAuth } from '../hooks/useAuth';

// ❌ Incorrect
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
const auth = useContext(AuthContext);
```

Common auth-related HMR issues:
- Multiple components updating simultaneously
- Auth state inconsistencies
- Context provider wrapping issues

To prevent these issues:
1. Use the useAuth hook exclusively
2. Keep AuthProvider at the root level (App.jsx)
3. Maintain consistent import patterns across all components

## Important Routing Guidelines

- The application uses React Router v6
- BrowserRouter is configured ONLY in `src/main.jsx`
- Never add another Router component (BrowserRouter, HashRouter, etc.) anywhere else
- All routing components must be nested under the main Router in `main.jsx`

## Common Issues

- Error: "You cannot render a <Router> inside another <Router>"
  - Cause: Multiple Router components in the application
  - Solution: Remove any additional Router components and keep only the one in `main.jsx`

## Routing Structure

```jsx
// src/main.jsx - Router configuration
<BrowserRouter>
  <App />
</BrowserRouter>

// src/App.jsx - Route definitions
<Routes>
  <Route path="/" element={<Home />} />
  ...
</Routes>
```

# Project Structure and Imports

## Directory Structure
```
src/
├── components/
│   ├── admin/         # Admin-related components
│   ├── layout/        # Layout components
│   ├── map/          # Map-related components
│   └── ...           # Other component categories
├── context/          # React context files
├── hooks/            # Custom React hooks
├── lib/             # Library configurations
├── pages/           # Page components
├── styles/          # Style-related files
└── utils/           # Utility functions
```

## Import Path Guidelines

- ALWAYS use relative paths for imports
- Component imports should match the exact directory structure
- Example correct imports:
  ```jsx
  // If importing from same directory:
  import { Button } from './Button';
  
  // If importing from parent directory:
  import { MapContainer } from '../map/MapContainer';
  
  // If importing from components/map from a page:
  import { MapContainer } from '../components/map/MapContainer';
  ```

## Common Import Mistakes to Avoid
- ❌ `import MapContainer from '../maps/MapContainer'`  // Wrong directory name
- ❌ `import { Button } from 'components/Button'`      // Missing relative path
- ✅ `import MapContainer from '../map/MapContainer'`  // Correct path
- ✅ `import { Button } from '../components/Button'`   // Correct relative path

## Import Validation
- Always verify the physical file exists at the specified path
- Check for correct directory names (case-sensitive)
- Ensure component names match their file names exactly

## File Naming & Import Conventions

⚠️ CRITICAL: Case Sensitivity Requirements

To prevent import errors and maintain consistency, follow these exact naming patterns:

### Component & Context Files
ALWAYS use PascalCase for:
- React Components: `TeamCard.jsx`, `PlayerProfile.jsx`
- Context Files: `AuthContext.jsx`, `TeamContext.jsx`
- Provider Files: `TeamProvider.jsx`

Example context setup:
```jsx
// src/context/AuthContext.jsx
export const AuthContext = createContext(null);
export function AuthProvider({ children }) { ... }

// Importing in other files
import { AuthProvider } from '../context/AuthContext';
import { AuthContext } from '../context/AuthContext';
```

### Utility & Configuration Files
Use camelCase for:
- Utility files: `supabaseClient.js`
- Hook files: `useAuth.js`
- Configuration files: `themeConfig.js`

### Constants & Data Files
Use camelCase for:
- Constants: `routingConstants.js`, `storage.js`
- Data files: `teamData.js`
- API utilities: `apiUtils.js`

Storage Buckets:
Constants related to storage buckets are defined in `src/constants/storage.js`:
```jsx
import { STORAGE_BUCKETS } from '../constants/storage';

// Available buckets:
// STORAGE_BUCKETS.TEAM_LOGOS
// STORAGE_BUCKETS.PLAYER_AVATARS
// STORAGE_BUCKETS.TEAM_MEDIA
// STORAGE_BUCKETS.NEWS_IMAGES
```

## Storage Buckets

The following storage buckets are configured in Supabase:

| Bucket Name  | Purpose                           | Public |
|-------------|-----------------------------------|--------|
| scoresheets | Store game score sheet images     | Yes    |
| players     | Store player photos and documents | Yes    |
| team-logos  | Store team logo images           | Yes    |
| team-assets | Store team-related media files    | Yes    |

To reference these buckets in code, always use the constants from `src/constants/storage.js`:

```javascript
import { STORAGE_BUCKETS } from '../constants/storage';

// Example usage:
const logoUrl = await uploadStorageFile(STORAGE_BUCKETS.TEAM_LOGOS, fileName, file);
```

⚠️ CRITICAL: Never use bucket names directly in code. Always reference them through the STORAGE_BUCKETS constant.

### Import Path Guidelines
- ALWAYS match the exact case of the file name
- NEVER change the casing in import paths
- Use consistent relative paths

Example correct imports:
```jsx
// ✅ Correct imports
import { AuthProvider } from '../context/AuthContext';
import { TeamProvider } from '../context/TeamProvider';
import { useAuth } from '../hooks/useAuth';

// ❌ Incorrect imports
import { AuthProvider } from '../context/authContext';
import { TeamProvider } from '../context/teamProvider';
```

### Common Case-Sensitivity Issues
- Import errors on case-sensitive systems (Linux/macOS)
- Build failures due to mismatched cases
- Hot reload issues with incorrect casing

To prevent these issues:
1. Always copy/paste the exact file name for imports
2. Use IDE auto-imports when available
3. Verify file name casing in the project explorer
4. Run builds on a case-sensitive system before deployment

### File Structure Example
```
src/
├── components/
│   ├── TeamCard.jsx
│   └── PlayerProfile.jsx
├── context/
│   ├── AuthContext.jsx
│   └── TeamContext.jsx
├── hooks/
│   └── useAuth.js
└── utils/
    └── supabaseClient.js
```

## Component File Names Reference

### Admin Components
- `NewsEditor` (src/components/admin/NewsEditor.jsx)
- `PlayerOfWeekEditor` (src/components/admin/PlayerOfWeekEditor.jsx)
- `RosterEditor` (src/components/admin/RosterEditor.jsx)
- `ScheduleEditor` (src/components/admin/ScheduleEditor.jsx)
- `SocialEmbedEditor` (src/components/admin/SocialEmbedEditor.jsx)
- `TeamDetailsEditor` (src/components/admin/TeamDetailsEditor.jsx) - Handles team creation, editing, and deletion
- `TeamFinancesEditor` (src/components/admin/TeamFinancesEditor.jsx)

### Regular Components
- `NewsCard` (src/components/NewsCard.jsx)
- `SocialMediaEmbed` (src/components/SocialMediaEmbed.jsx)
- `SocialMediaLinks` (src/components/SocialMediaLinks.jsx)
- `TeamNews` (src/components/TeamNews.jsx)
- `WeatherDisplay` (src/components/WeatherDisplay.jsx)

### Common Components
- `CardContainer` (src/components/common/CardContainer.jsx)
- `SectionHeading` (src/components/common/SectionHeading.jsx)

### Component Usage Guidelines
- ALWAYS use exact file names in imports
- NEVER change casing in import paths
- Verify component names against this list before using
- All components must be imported from their exact paths
- Match the case exactly as shown above

Example correct imports:
```jsx
import NewsEditor from '../components/admin/NewsEditor';
import PlayerOfWeekEditor from '../components/admin/PlayerOfWeekEditor';
import TeamDetailsEditor from '../components/admin/TeamDetailsEditor';
import SocialMediaLinks from '../components/SocialMediaLinks';
```

# Chakra UI Guidelines and Theming

## ⚠️ CRITICAL: Color Management

ALWAYS configure Chakra's color tokens to use our color scheme instead of trying to override Chakra's defaults. This ensures:
- Consistent theming throughout the application
- Better maintainability
- Proper component behavior
- No CSS specificity conflicts

### ✅ Correct Approach
- Map our colors to Chakra's token system in `theme.js`
- Override Chakra's default color scales with our brand colors
- Use Chakra's semantic tokens
- Configure component defaults to use our brand tokens

### ❌ Incorrect Approach
- Using CSS overrides
- Fighting Chakra's default styles
- Mixing different color systems
- Direct color values in components

Example of correct color configuration:
```jsx
// In theme.js
colors: {
  brand: {
    primary: {
      base: '#081208',    // Base color for buttons/icons
      hover: '#70bf73',   // Hover state
      active: '#357a38',  // Active state
    },
    background: '#a6d7a8',  // Main app background
    surface: {
      base: '#1e4620',    // Cards/containers
      input: '#82c785',   // Input fields
    },
    text: {
      primary: '#dbefdc',   // Primary text
      placeholder: '#82c785' // Placeholder text
    }
  }
}

