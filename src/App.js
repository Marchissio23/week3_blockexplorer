import { Alchemy, Network } from 'alchemy-sdk'; // Importing Alchemy SDK and Network enums for blockchain interaction
import React, { useEffect, useState } from 'react'; // Importing React and its hooks
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'; // Importing React Router components for navigation

import './App.css'; // Importing custom CSS for styling

// Refer to the README doc for more information about using API
// keys in client-side code. You should never do this in production
// level code.
const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY, // Using environment variable for API key
  network: Network.ETH_MAINNET, // Setting network to Ethereum mainnet
};

// In this week's lessons we used ethers.js. Here we are using the
// Alchemy SDK is an umbrella library with several different packages.
//
// You can read more about the packages here:
//   https://docs.alchemy.com/reference/alchemy-sdk-api-surface-overview#api-surface
const alchemy = new Alchemy(settings); // Creating an instance of Alchemy with the specified settings

// Main App component
function App() {
  return (
    <Router>
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <Link className="navbar-brand" to="/">Blockchain Explorer</Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/accounts">Accounts</Link>
              </li>
            </ul>
          </div>
        </nav>
        <Switch>
          <Route path="/" exact component={Home} /> {/* Route for Home component */}
          <Route path="/accounts" component={Accounts} /> {/* Route for Accounts component */}
        </Switch>
      </div>
    </Router>
  );
}

// Home component
function Home() {
  const [blockNumber, setBlockNumber] = useState(null); // State for storing the latest block number
  const [blockDetails, setBlockDetails] = useState(null); // State for storing block details
  const [selectedTransaction, setSelectedTransaction] = useState(null); // State for storing selected transaction details

  // useEffect to fetch the latest block number on component mount
  useEffect(() => {
    async function getBlockNumber() {
      const number = await alchemy.core.getBlockNumber(); // Fetching the latest block number
      setBlockNumber(number); // Updating state with the fetched block number
    }

    getBlockNumber(); // Calling the function
  }, []);

  // Function to handle block click and fetch block details
  const handleBlockClick = async () => {
    if (blockNumber !== null) {
      const block = await alchemy.core.getBlockWithTransactions(blockNumber); // Fetching block details along with transactions
      setBlockDetails(block); // Updating state with block details
    }
  };

  // Function to handle transaction click and fetch transaction receipt
  const handleTransactionClick = async (transactionHash) => {
    const txReceipt = await alchemy.core.getTransactionReceipt(transactionHash); // Fetching transaction receipt
    setSelectedTransaction(txReceipt); // Updating state with transaction receipt
  };

  // Function to shorten Ethereum addresses for display
  const shortenAddress = (address) => address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A';

  return (
    <div>
      <h1>Blockchain Explorer</h1>
      <div>
        <button className="btn btn-primary mb-3" onClick={handleBlockClick}>
          Get Block {blockNumber} Details
        </button>
      </div>
      {blockDetails && !selectedTransaction && ( // Display block details if available and no transaction is selected
        <div>
          <h2>Block Number: {blockDetails.number}</h2>
          <h3>Transactions:</h3>
          <table className="transaction-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Hash</th>
                <th>From</th>
                <th>To</th>
              </tr>
            </thead>
            <tbody>
              {blockDetails.transactions.map((tx, index) => ( // Iterating through transactions in the block
                <tr key={index} onClick={() => handleTransactionClick(tx.hash)} style={{ cursor: 'pointer' }}>
                  <td>{index + 1}</td>
                  <td><a href="#">{shortenAddress(tx.hash)}</a></td> {/* Shortened transaction hash */}
                  <td><a href="#">{shortenAddress(tx.from)}</a></td> {/* Shortened from address */}
                  <td><a href="#">{shortenAddress(tx.to)}</a></td> {/* Shortened to address */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedTransaction && ( // Display transaction details if a transaction is selected
        <div>
          <button className="btn btn-secondary mb-3" onClick={() => setSelectedTransaction(null)}>
            Back to Block Details
          </button>
          <TransactionDetails transaction={selectedTransaction} /> {/* Displaying transaction details */}
        </div>
      )}
    </div>
  );
}

// TransactionDetails component to display detailed information about a transaction
function TransactionDetails({ transaction }) {
  return (
    <div className="border p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
      <h3>Transaction Details</h3>
      <p><strong>To:</strong> {transaction.to}</p>
      <p><strong>From:</strong> {transaction.from}</p>
      <p><strong>Contract Address:</strong> {transaction.contractAddress || 'N/A'}</p>
      <p><strong>Transaction Index:</strong> {transaction.transactionIndex}</p>
      <p><strong>Gas Used:</strong> {transaction.gasUsed.toString()}</p>
      <p><strong>Logs Bloom:</strong> {transaction.logsBloom}</p>
      <p><strong>Transaction Hash:</strong> {transaction.transactionHash}</p>
      <p><strong>Logs:</strong> {JSON.stringify(transaction.logs)}</p>
      <p><strong>Block Number:</strong> {transaction.blockNumber}</p>
      <p><strong>Type:</strong> {transaction.type}</p>
      <p><strong>Status:</strong> {transaction.status === 1 ? 'Success' : 'Failure'}</p>
      <p><strong>Cumulative Gas Used:</strong> {transaction.cumulativeGasUsed.toString()}</p>
      <p><strong>Effective Gas Price:</strong> {transaction.effectiveGasPrice.toString()}</p>
    </div>
  );
}

// Accounts component to look up Ethereum account balances
function Accounts() {
  const [address, setAddress] = useState(''); // State for storing user-input Ethereum address
  const [balance, setBalance] = useState(null); // State for storing balance of the address

  // Handler for input field changes
  const handleAddressChange = (e) => {
    setAddress(e.target.value); // Updating state with the new address
  };

  // Handler for the lookup button click
  const handleLookup = async () => {
    if (address) {
      const balance = await alchemy.core.getBalance(address); // Fetching balance of the address
      setBalance(balance); // Updating state with the fetched balance
    }
  };

  return (
    <div>
      <h1>Account Balance Lookup</h1>
      <div className="form-group">
        <label htmlFor="address">Enter Ethereum Address:</label>
        <input 
          type="text" 
          className="form-control" 
          id="address" 
          value={address} 
          onChange={handleAddressChange} 
        />
      </div>
      <button className="btn btn-primary" onClick={handleLookup}>Look Up Balance</button>
      {balance !== null && ( // Display balance if available
        <div className="mt-3">
          <h2>Balance: {balance.toString()} wei</h2>
        </div>
      )}
    </div>
  );
}

export default App; // Exporting the App component as the default export
