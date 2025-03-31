import {
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  useToast
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import { formFieldStyles } from '../../styles/formFieldStyles';

const TeamFinancesEditor = ({ teamId, isDisabled = false }) => {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    type: 'income',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().slice(0, 16)
  });
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (teamId) {
      fetchTransactions();
    }
  }, [teamId]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('team_finances')
        .select('*')
        .eq('team_id', teamId)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      toast({
        title: 'Error fetching transactions',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleNewTransactionChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to perform this action',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!newTransaction.category || !newTransaction.amount) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('team_finances')
        .insert([{
          team_id: teamId,
          type: newTransaction.type,
          category: newTransaction.category,
          amount: parseFloat(newTransaction.amount),
          description: newTransaction.description,
          date: new Date(newTransaction.date).toISOString(),
          created_by: user.id // Updated column name
        }])
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST301') {
          throw new Error('You do not have permission to add transactions');
        }
        throw error;
      }

      setTransactions(prev => [data, ...prev]);
      setNewTransaction({
        type: 'income',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().slice(0, 16)
      });

      toast({
        title: 'Transaction added successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error adding transaction',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <VStack spacing={4} align="stretch" opacity={isDisabled ? 0.6 : 1}>
      <VStack as="form" onSubmit={handleAddTransaction} spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Type</FormLabel>
          <Select
            {...formFieldStyles}
            name="type"
            value={newTransaction.type}
            onChange={handleNewTransactionChange}
            isDisabled={isDisabled}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Category</FormLabel>
          <Select
            {...formFieldStyles}
            name="category"
            value={newTransaction.category}
            onChange={handleNewTransactionChange}
            isDisabled={isDisabled}
          >
            <option value="">Select Category</option>
            <option value="dues">Player Dues</option>
            <option value="sponsorship">Sponsorship</option>
            <option value="equipment">Equipment</option>
            <option value="uniforms">Uniforms</option>
            <option value="field">Field Rental</option>
            <option value="other">Other</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Amount</FormLabel>
          <NumberInput
            {...formFieldStyles}
            name="amount"
            value={newTransaction.amount}
            onChange={(valueString) => handleNewTransactionChange({
              target: { name: 'amount', value: valueString }
            })}
            min={0}
            precision={2}
            isDisabled={isDisabled}
          >
            <NumberInputField {...formFieldStyles} />
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Input
            {...formFieldStyles}
            name="description"
            value={newTransaction.description}
            onChange={handleNewTransactionChange}
            isDisabled={isDisabled}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Date</FormLabel>
          <Input
            {...formFieldStyles}
            type="datetime-local"
            name="date"
            value={newTransaction.date}
            onChange={handleNewTransactionChange}
            isDisabled={isDisabled}
          />
        </FormControl>

        <Button
          type="submit"
          isDisabled={isDisabled}
        >
          Add Transaction
        </Button>
      </VStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th color="brand.text.primary">Date</Th>
            <Th color="brand.text.primary">Type</Th>
            <Th color="brand.text.primary">Category</Th>
            <Th color="brand.text.primary">Amount</Th>
            <Th color="brand.text.primary">Description</Th>
          </Tr>
        </Thead>
        <Tbody>
          {transactions.map((transaction) => (
            <Tr key={transaction.id}>
              <Td color="brand.text.primary">
                {new Date(transaction.date).toLocaleString()}
              </Td>
              <Td color="brand.text.primary" textTransform="capitalize">
                {transaction.type}
              </Td>
              <Td color="brand.text.primary" textTransform="capitalize">
                {transaction.category}
              </Td>
              <Td color="brand.text.primary">
                ${parseFloat(transaction.amount).toFixed(2)}
              </Td>
              <Td color="brand.text.primary">
                {transaction.description}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </VStack>
  );
};

TeamFinancesEditor.propTypes = {
  teamId: PropTypes.string,
  isDisabled: PropTypes.bool
};

export default TeamFinancesEditor;





























