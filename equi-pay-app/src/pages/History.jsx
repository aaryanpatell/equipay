// Importing necessary modules and components
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Typography, Paper, useTheme, Button, List, ListItem, ListItemText } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import * as Fetch from "../lib/fetch"; // Adjust this import path as necessary

// Registering the necessary chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function History() {
  // Hooks for getting URL parameters, navigation, and theming
  const { userId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  // State for storing the chart data and individual expenses
  const [expensesData, setExpensesData] = useState({ labels: [], datasets: [] });
  const [individualExpenses, setIndividualExpenses] = useState([]);

  // useEffect to fetch expenses data when component mounts or userId/theme changes
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        // Fetching expenses data from the server
        const expensesResponse = await Fetch.get("expenses", { user_id: userId });
        const labels = expensesResponse.map(expense => expense.name); // Setting expense names as labels for the chart

        // Creating datasets for the chart with different colors for each expense
        const datasets = expensesResponse.map((expense, index) => ({
          label: expense.name,
          data: [expense.balance], // The balance is set as the data point
          backgroundColor: getGroupColor(index), // Assigning a color based on the index
        }));

        // Updating the state with the new data
        setExpensesData({ labels, datasets });
        setIndividualExpenses(expensesResponse);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchExpenses();
  }, [userId, theme]);

  // Function to get a color for each group (expense)
  const getGroupColor = (index) => {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#A63EC5', '#00B2A9']; // Defined set of colors
    return colors[index % colors.length]; // Cycles through the colors array
  };

  // Dynamically calculate the bar width based on the number of data points
  const calculateBarPercentage = (dataLength) => {
    return dataLength > 10 ? 0.2 : 0.5;
  };

  // Chart options configuration
  const options = {
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        barPercentage: calculateBarPercentage(expensesData.labels.length), // Dynamic bar width
        categoryPercentage: 1
      },
      y: { beginAtZero: true, grid: { borderDash: [5, 5] } }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          boxWidth: 20,
          padding: 20,
          color: theme.palette.text.primary,
        }
      },
      // Custom tooltip to format the values as currency
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    }
  };
  
  // Navigation back to the user dashboard
  const handleBackToDashboard = () => {
    navigate(`/user/${userId}`);
  };

  // The component's rendered JSX
  return (
    <Paper style={{ padding: theme.spacing(3), marginTop: theme.spacing(3), background: '#fff' }}>
      <Button
        startIcon={<ArrowBackIosIcon />}
        onClick={handleBackToDashboard}
        style={{ marginBottom: theme.spacing(2) }}
      >
        Back to Dashboard
      </Button>
      <Typography variant="h6" gutterBottom align='center'>
        Expense History for User {userId}
      </Typography>
      <div style={{ height: '500px', marginBottom: theme.spacing(2) }}>
        <Bar data={expensesData} options={options} />
      </div>
      <Typography variant="h6" gutterBottom>
        Individual Expenses
      </Typography>
      <List style={{ maxHeight: '300px', overflow: 'auto' }}>
        {individualExpenses.map((expense, index) => (
          <ListItem key={index} style={{ backgroundColor: getGroupColor(index), marginBottom: theme.spacing(1), borderRadius: theme.shape.borderRadius }}>
            <ListItemText
              primary={`${expense.name}`} // Displaying the expense name
              secondary={`Amount: $${expense.balance} - Date: ${new Date(expense.created_at).toLocaleDateString()}`} // Displaying the amount and date
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default History;
