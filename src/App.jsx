import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import "./App.css";
import abi from "./utils/WavePortal.json";

const App = () => {
  let wavePortalContract;
  
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");

  const handleMessageChange = e => {
    setMessage(e.target.value);
  }
  // const contractAddress = "0x6F98dB5F8B6d79bF39eBDBD734B1f7aFBD2E1501";
  // const contractAddress = "0xC6D55Bc105DD47E63a5F32b67583399cD8802A22";
  const contractAddress = "0x47D770846aFaef267202f3eFEA9D2e796f9dAB20";

  const contractABI = abi.abi;
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
  
      if (!ethereum) {
        console.log("Make sure you have metamask!");
      } else {

        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({method: "eth_accounts"});

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("found an authorized account:", account);
        setCurrentAccount(account);
        await getAllWaves();
        console.log("GET ALL WAVES CALLED");

      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" })
    } catch (error) {
      console.log(error);
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      }

      const waves = await wavePortalContract.getAllWaves();

      const wavesCleaned = waves.map(wave => {
        return {
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message
        }
      })
      console.log({waves, wavesCleaned})

      setAllWaves(wavesCleaned);
    } catch (error) {
      console.log(error);
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        console.log({wavePortalContract});

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave(message);
        console.log("Mining...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Mined --", waveTxn.hash);
        await getAllWaves();
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  }

  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
          Gerry here. Connect your Ethereum wallet and wave!
        </div>

        <form className="bio">
          <label>
            Message: <input type="text" value={message} onChange={handleMessageChange} />
          </label>
        </form>
        
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {!currentAccount && (
        <button className="waveButton" onClick={connectWallet}>
          Connect Wallet
        </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App
