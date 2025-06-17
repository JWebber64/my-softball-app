import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  VStack
} from '@chakra-ui/react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import { formLabelStyles } from '../../styles/formFieldStyles';
import ActionButtons from '../common/ActionButtons';

// Custom form field styles with black text
const customFormFieldStyles = {
  bg: "brand.surface.input",
  color: "black",
  borderColor: "brand.border",
  _hover: { borderColor: 'brand.primary.hover' },
  _focus: { 
    borderColor: 'brand.primary.hover',
    boxShadow: 'none'
  },
  _placeholder: {
    color: 'black'  // Change placeholder color to black
  },
  sx: {
    '& option': {
      bg: 'brand.surface.base',
      color: 'black'
    },
    '&::placeholder': {
      color: 'black !important'  // Additional CSS for placeholder
    }
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const TeamFinancesEditor = ({ teamId = '', isDisabled = false, buttonProps = {} }) => {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    type: 'income',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().slice(0, 16)
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

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
          created_by: user.id
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
      onClose();

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

  const handleGenerateReport = async () => {
    try {
      // Fetch team info for the report header
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('name, season')
        .eq('id', teamId)
        .single();
      
      if (teamError) throw teamError;
      
      // Make sure we have transactions to report
      if (!transactions || transactions.length === 0) {
        toast({
          title: 'No transactions',
          description: 'There are no financial transactions to include in the report.',
          status: 'warning',
          duration: 3000,
        });
        return;
      }
      
      // Calculate summary data
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const balance = totalIncome - totalExpenses;
      
      // Group transactions by category
      const categories = {};
      transactions.forEach(t => {
        if (!categories[t.category]) {
          categories[t.category] = { income: 0, expense: 0 };
        }
        categories[t.category][t.type] += t.amount;
      });
      
      // Create HTML content for the report
      const reportDate = format(new Date(), 'MMMM d, yyyy');
      const reportTitle = `${teamData.name} Financial Report - ${reportDate}`;
      
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1, h2, h3 {
              color: #2c3e50;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #eee;
              padding-bottom: 10px;
            }
            .summary {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              background: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
            }
            .summary-item {
              text-align: center;
              flex: 1;
            }
            .summary-value {
              font-size: 24px;
              font-weight: bold;
            }
            .positive { color: #27ae60; }
            .negative { color: #e74c3c; }
            .neutral { color: #2980b9; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th, td {
              padding: 12px 15px;
              border-bottom: 1px solid #ddd;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            tr:hover {
              background-color: #f5f5f5;
            }
            .category-summary {
              margin-bottom: 30px;
            }
            .footer {
              text-align: center;
              margin-top: 50px;
              font-size: 12px;
              color: #7f8c8d;
            }
            @media print {
              body {
                padding: 0;
                max-width: 100%;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportTitle}</h1>
            <p>Season: ${teamData.season || 'Current'}</p>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <h3>Total Income</h3>
              <div class="summary-value positive">${formatCurrency(totalIncome)}</div>
            </div>
            <div class="summary-item">
              <h3>Total Expenses</h3>
              <div class="summary-value negative">${formatCurrency(totalExpenses)}</div>
            </div>
            <div class="summary-item">
              <h3>Balance</h3>
              <div class="summary-value ${balance >= 0 ? 'positive' : 'negative'}">${formatCurrency(balance)}</div>
            </div>
          </div>
          
          <h2>Category Breakdown</h2>
          <div class="category-summary">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Income</th>
                  <th>Expenses</th>
                  <th>Net</th>
                </tr>
              </thead>
              <tbody>
      `;
      
      // Add category rows
      Object.entries(categories).forEach(([category, amounts]) => {
        const net = amounts.income - amounts.expense;
        htmlContent += `
          <tr>
            <td>${category}</td>
            <td>${formatCurrency(amounts.income)}</td>
            <td>${formatCurrency(amounts.expense)}</td>
            <td class="${net >= 0 ? 'positive' : 'negative'}">${formatCurrency(net)}</td>
          </tr>
        `;
      });
      
      htmlContent += `
              </tbody>
            </table>
          </div>
          
          <h2>Transaction Details</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      // Add transaction rows
      transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(transaction => {
          const date = format(new Date(transaction.date), 'MMM d, yyyy');
          htmlContent += `
            <tr>
              <td>${date}</td>
              <td>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</td>
              <td>${transaction.category}</td>
              <td>${transaction.description || '-'}</td>
              <td class="${transaction.type === 'income' ? 'positive' : 'negative'}">
                ${formatCurrency(transaction.amount)}
              </td>
            </tr>
          `;
        });
      
      htmlContent += `
            </tbody>
          </table>
          
          <div class="footer">
            <p>Generated on ${reportDate}</p>
            <button onclick="window.print()">Print Report</button>
          </div>
        </body>
        </html>
      `;
      
      // Create a Blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Open the report in a new tab
      const reportWindow = window.open(url, '_blank');
      
      // Clean up the URL object after the window is loaded
      reportWindow.onload = () => {
        URL.revokeObjectURL(url);
      };
      
      toast({
        title: 'Report generated',
        description: 'Financial report has been generated and opened in a new tab.',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error generating report',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('team_finances')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== transactionId));
      
      toast({
        title: 'Transaction deleted successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error deleting transaction',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleEditTransaction = (transaction) => {
    setNewTransaction({
      ...transaction,
      amount: transaction.amount.toString(),
      date: new Date(transaction.date).toISOString().slice(0, 16)
    });
    setIsEditing(true);
    onOpen();
  };

  return (
    <Flex direction="column" align="center" width="100%">
      <ButtonGroup spacing={4} mb={4}>
        <Button
          onClick={onOpen}
          isDisabled={isDisabled}
          {...buttonProps?.primary}
        >
          Add Transaction
        </Button>
        <Button
          onClick={handleGenerateReport}
          isDisabled={isDisabled}
          {...buttonProps?.primary}
        >
          Generate Report
        </Button>
      </ButtonGroup>

      {/* Transactions Table */}
      {transactions.length > 0 && (
        <Box overflowX="auto" width="100%" maxWidth="900px" mb={4}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th color="brand.text.primary">Date</Th>
                <Th color="brand.text.primary">Type</Th>
                <Th color="brand.text.primary">Category</Th>
                <Th color="brand.text.primary">Amount</Th>
                <Th color="brand.text.primary">Description</Th>
                <Th color="brand.text.primary">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {transactions.map((transaction) => (
                <Tr key={transaction.id}>
                  <Td>{format(new Date(transaction.date), 'MMM d, yyyy')}</Td>
                  <Td>
                    <Text color={transaction.type === 'income' ? 'green.500' : 'red.500'}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </Text>
                  </Td>
                  <Td>{transaction.category}</Td>
                  <Td>
                    <Text color={transaction.type === 'income' ? 'green.500' : 'red.500'}>
                      ${transaction.amount.toFixed(2)}
                    </Text>
                  </Td>
                  <Td>{transaction.description || '-'}</Td>
                  <Td>
                    <ActionButtons
                      onEdit={() => handleEditTransaction(transaction)}
                      onDelete={() => handleDeleteTransaction(transaction.id)}
                      editLabel="Edit transaction"
                      deleteLabel="Delete transaction"
                      isDisabled={isDisabled}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {transactions.length === 0 && (
        <Box textAlign="center" my={6} color="brand.text.primary">
          No transactions found
        </Box>
      )}

      {/* Add Transaction Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay bg="brand.overlay" />
        <ModalContent bg="brand.surface.base" color="brand.text.primary">
          <ModalHeader borderBottomWidth="1px" borderColor="brand.border">
            {isEditing ? 'Edit Finance Entry' : 'Add Finance Entry'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel {...formLabelStyles}>Type</FormLabel>
                <Select
                  name="type"
                  value={newTransaction.type}
                  onChange={handleNewTransactionChange}
                  {...customFormFieldStyles}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel {...formLabelStyles}>Category</FormLabel>
                <Input
                  name="category"
                  value={newTransaction.category}
                  onChange={handleNewTransactionChange}
                  placeholder="e.g., Sponsorship, Equipment"
                  {...customFormFieldStyles}
                />
              </FormControl>

              <FormControl>
                <FormLabel {...formLabelStyles}>Amount</FormLabel>
                <Input
                  name="amount"
                  type="number"
                  value={newTransaction.amount}
                  onChange={handleNewTransactionChange}
                  placeholder="0.00"
                  {...customFormFieldStyles}
                />
              </FormControl>

              <FormControl>
                <FormLabel {...formLabelStyles}>Description</FormLabel>
                <Input
                  name="description"
                  value={newTransaction.description}
                  onChange={handleNewTransactionChange}
                  placeholder="Optional details about the transaction"
                  {...customFormFieldStyles}
                />
              </FormControl>

              <FormControl>
                <FormLabel {...formLabelStyles}>Date</FormLabel>
                <Input
                  name="date"
                  type="datetime-local"
                  value={newTransaction.date}
                  onChange={handleNewTransactionChange}
                  {...customFormFieldStyles}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor="brand.border">
            <Button
              onClick={handleAddTransaction}
              mr="auto"  // This pushes the button to the left
              {...buttonProps?.primary}
            >
              Add
            </Button>
            <Button
              variant="outline"
              bg="black"
              color="white"
              borderColor="brand.border"
              _hover={{ 
                bg: "gray.800",
                opacity: 0.9 
              }}
              onClick={onClose}
              {...buttonProps?.secondary}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

TeamFinancesEditor.propTypes = {
  teamId: PropTypes.string,
  isDisabled: PropTypes.bool,
  buttonProps: PropTypes.shape({
    primary: PropTypes.object,
    secondary: PropTypes.object
  })
};

export default TeamFinancesEditor;



















































