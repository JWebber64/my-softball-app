import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { teamService } from '../../services/teamService';

export default function TeamMembersModal({ isOpen, onClose, team }) {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchMembers = async () => {
      if (!team?.id) return;
      
      try {
        const data = await teamService.getTeamMembers(team.id);
        setMembers(data);
      } catch (error) {
        toast({
          title: 'Error fetching team members',
          description: error.message,
          status: 'error',
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, team?.id, toast]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const updatedMember = await teamService.updateMemberRole(team.id, userId, newRole);
      setMembers(members.map(member =>
        member.team_members_user_id === userId ? { ...member, role: updatedMember.role } : member
      ));
      
      toast({
        title: 'Role updated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error updating role',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Team Members - {team?.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {members.map(member => (
                  <Tr key={member.id}>
                    <Td>{member.users.email}</Td>
                    <Td>
                      <Select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.team_members_user_id, e.target.value)}
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </Select>
                    </Td>
                    <Td>
                      <Button
                        size="sm"
                        colorScheme="red"
                        isDisabled={member.role === 'admin'}
                      >
                        Remove
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
