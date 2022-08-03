import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import  myEpicNft from "./utils/MyEpicNFT.json"
import "./styles/App.css"
import twitterLogo from "./assets/twitter-logo.svg"

// Constants
const TWITTER_HANDLE = "web3dev_"
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`
const OPENSEA_LINK = ""
const TOTAL_MINT_COUNT = 50

const CONTRACT_ADDRESS = "0x638f6C431053410361A5297b3CB9cA7E059a6051";

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Check if MetaMask is installed!")
      return;
    } else {
      console.log("Ethereum object is here!", ethereum)
    }
    /*
     * Check if wallet is authorized by user.
     */
    const accounts = await ethereum.request({ method: "eth_accounts" });
    /*
     * If user has many accounts
     */
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      //setupEventListener if user already connected
      setupEventListener();
    } else {
      console.log("No authorized account founded.");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Baixe a MetaMask!");
        return;
      }
      /*
       * get account access.
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Conectado à rede " + chainId);
      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4"; 
      if (chainId !== rinkebyChainId) {
      	alert("Você não está conectado a rede Rinkeby de teste!");
      }
      /*
       * public address from Metamask auth.
       */
      console.log("Conectado", accounts[0]);
      setCurrentAccount(accounts[0]);
      //setupEventListener for the first time
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

    /*
    * Contract emit listener.
    */
  const setupEventListener = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(
            `Olá pessoa! Já cunhamos seu NFT. Pode ser que esteja em branco agora pois demora até o máximo 10 minutos para aparecer no OpenSea. Aqui está o link: <https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}>`
          )
        })

        console.log("Setup event listener!")
      } else {
        console.log("Objeto ethereum não existe!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        console.log("Vai abrir a carteira agora para pagar o gás...");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log("Cunhando...espere por favor.");
        await nftTxn.wait();
        console.log(
          `Cunhado, veja a transação: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Objeto ethereum não existe!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  //Render methods
  const renderNotConnectedContainer = () => (
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Minha Coleção de NFT</p>
          <p className="sub-text">Exclusivos! Maravilhosos! Únicos! Descubra seu NFT hoje.</p>
          {renderNotConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`feito com ❤️ pela @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  )
}

export default App
