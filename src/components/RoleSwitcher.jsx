import { Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import { roleService } from '../services/roleService';

const RoleSwitcher = () => {
  const { user, userRole, setUserRole } = useAuth();

  if (!user?.roles || user.roles.length <= 1) return null;

  const handleRoleSwitch = async (role) => {
    try {
      await roleService.updateUserRole(user.id, role);
      setUserRole(role);
    } catch (error) {
      console.error('Error switching role:', error);
    }
  };

  return (
    <Menu>
      <MenuButton as={Button} size="sm">
        {userRole?.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')}
      </MenuButton>
      <MenuList>
        {user.roles.map((role) => (
          <MenuItem
            key={role}
            onClick={() => handleRoleSwitch(role)}
            fontWeight={role === userRole ? 'bold' : 'normal'}
          >
            {role.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default RoleSwitcher;

