import React from "react"
import { useState, useEffect } from 'react'
import '../App.css'
import dolphinLogo from '../images/dolphin-logo.png'
import { FaInstagram } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import Dolphins from '../images/header-dolphins.png'
import { nftContractAddress } from '../config.js'
import { BigNumber, ethers } from 'ethers'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'
import NFT from '../utils/DolphnNFT.json'



function Header() {
    const [currentAccount, setCurrentAccount] = useState('')
    const [counter, setCounter] = useState(1)
    const [miningStatus, setMiningStatus] = useState(0)
    const [loadingState, setLoadingState] = useState(0)
    const [mintedNFT, setMintedNFT] = useState(0)
    const [correctNetwork, setCorrectNetwork] = useState(false)
    const [mintButtonText, setMintButtonText] = useState("MINT NOW")
    const [isWalletConnected, setIsWalletConnected] = useState(false)
    const connectWallet = async () => {

        try {
            const { ethereum } = window

            if (!ethereum) {
                console.log('Metamask not detected')
                return
            }
            let chainId = await ethereum.request({ method: 'eth_chainId' })
            console.log('Connected to chain:' + chainId)
            const polygonChainId = '0x89'
            const mumbaiChainId = '0x13881'


            const devChainId = 1337
            const localhostChainId = `0x${Number(devChainId).toString(16)}`

            if (chainId !== polygonChainId && chainId !== mumbaiChainId ) {
                toast("You are not connected to Polygon network \n", {
                    type: toast.TYPE.ERROR,
                    draggable: true,
                    autoClose: 5000,
                });
                return
            }

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

            console.log('Found account', accounts[0])
            setCurrentAccount(accounts[0])
            toast("Wallet connected successfully", {
                type: toast.TYPE.SUCCESS,
                draggable: true,
                autoClose: 5000,
            });

            window.location.reload();

        } catch (error) {
            let errordata = error.data ? error.data.message.split(":")[1] : error.message.split(":")[1]
            console.log(errordata)
            toast("Unable to connect wallet", {
                type: toast.TYPE.ERROR,
                draggable: true,
                autoClose: 5000,
            });
            console.log("Error:", errordata)

        }
    }

    const mintCharacter = async () => {
        try {

            const { ethereum } = window

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum)
                const signer = provider.getSigner()
                const nftContract = new ethers.Contract(
                    nftContractAddress,
                    NFT.abi,
                    signer
                )
                const num = { counter }

                let cost
                let owner = await nftContract.owner()
                owner = owner.toLowerCase()

                const currentAcc = currentAccount.toLowerCase()

                cost = await nftContract.cost()
                const costinEth = cost / 1E18

                let totalCost = costinEth * num.counter
                if (owner == currentAcc) {

                    totalCost = 0
                }

                let nftTx = await nftContract.createRandomNFT(BigNumber.from(num.counter), { value: ethers.utils.parseEther(String(totalCost)) })
                console.log('Mining....', nftTx.hash)
                setMiningStatus(0)
                setMintButtonText("MINTING...")
                let tx = await nftTx.wait()
                setLoadingState(1)
                console.log('Mined!', tx)

                let tokenId = await nftContract.totalSupply()
                console.log("Token Id is " + tokenId)
                console.log(
                    `Mined, see transaction: https://polygonscan.com/tx/${nftTx.hash}`

                )
                toast("NFT minted successfully", {
                    type: toast.TYPE.SUCCESS,
                    draggable: true,
                    autoClose: 5000,
                });
                setMintButtonText("MINT NOW")

                window.location.reload();

                getMintedNFT(tokenId)
                console.log(miningStatus)
                console.log(mintedNFT)
                console.log(loadingState)
            } else {
                console.log("Ethereum object doesn't exist!")
            }

        } catch (error) {
            // console.log("Error:", error.data.message)
            let errordata = error.data ? error.data.message.split(":")[1] : error.message.split(":")[1]
            console.log(errordata)
            if (errordata == " https") {
                errordata = "Supply limit reached"
            }
            toast(errordata, {
                type: toast.TYPE.ERROR,
                draggable: true,
                autoClose: 10000,
            });

            setTimeout(function () {
                window.location.reload();
            }, 60 * 1000);

        }
    }

    const checkCorrectNetwork = async () => {
        const { ethereum } = window
        let chainId = await ethereum.request({ method: 'eth_chainId' })
        console.log('Connected to chain:' + chainId)

        const polygonChainId = '0x89'
        const mumbaiChainId = '0x13881'


        const devChainId = 1337
        const localhostChainId = `0x${Number(devChainId).toString(16)}`

        if (chainId !== polygonChainId && chainId !== localhostChainId || chainId !== mumbaiChainId) {
            setCorrectNetwork(false)
        } else {
            setCorrectNetwork(true)
        }
    }
    const checkIfWalletIsConnected = async () => {
        const { ethereum } = window
        if (ethereum) {
            console.log('Got the ethereum obejct: ', ethereum)
        } else {
            console.log('No Wallet found. Connect Wallet')
        }

        const accounts = await ethereum.request({ method: 'eth_accounts' })

        if (accounts.length !== 0) {
            setIsWalletConnected(true)
            console.log('Found authorized Account: ', accounts[0])
            setCurrentAccount(accounts[0])
        } else {
            setIsWalletConnected(false)
            console.log('No authorized account found')
        }
    }
    useEffect(() => {
        checkIfWalletIsConnected()
        checkCorrectNetwork()
    }, [])
    const getMintedNFT = async (tokenId) => {
        try {
            const { ethereum } = window

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum)
                const signer = provider.getSigner()
                const nftContract = new ethers.Contract(
                    nftContractAddress,
                    NFT.abi,
                    signer
                )

                let tokenUri = await nftContract.tokenURI(tokenId)
                let newToeknUri = `https://gateway.pinata.cloud/ipfs/${tokenUri.split("//")[1]}`
                let data = await axios.get(newToeknUri);
                let meta = data.data
                setMiningStatus(1)
                setMintedNFT(meta.image)

            } else {
                console.log("Ethereum object doesn't exist!")
            }
        } catch (error) {
            let errordata = error.data ? error.data.message.split(":")[1] : error.message.split(":")[1]

            toast(errordata, {
                type: toast.TYPE.ERROR,
                draggable: true,
                autoClose: 10000,
            });
            console.log("Error:", errordata)
            setTimeout(function () {
                window.location.reload();
            }, 60 * 1000);

        }
    }
    const increment = async () => {
        setCounter(counter + 1)
        console.log("incremented")

    }
    const decrement = async () => {
        if (counter > 1) { setCounter(counter - 1) }
        console.log("decremented")
    }
    return (
        <>
            <nav>
                <div className="nav--left" id="mint">
                    <img src={dolphinLogo} alt="logo" className="nav--logo" />
                    <span>Crazy Dolphin</span>
                </div>
                <div className="nav--right">
                    <a href="https://twitter.com/" target="blank"><FaTwitter className="nav--icons" /></a>
                    <a href="https://www.instagram.com/" target="blank"><FaInstagram className="nav--icons" /></a>
                    {/* <button className="nav--button" onClick={connectWallet}>{walletText}</button> */}
                    {!isWalletConnected ? (
                        <button className="nav--button" onClick={connectWallet}>CONNECT WALLET</button>
                    ) :  (
                        <button className="nav--button" onClick="">CONNECTED</button>
                    ) }
                </div>

            </nav>

            <section className="header--section" >
                <div className="header--text">
                    <h1 className="header--plain--text">Mint your favourite</h1>
                    <h1 className="header--plain--text"><span className="header--bg--white--text">Crazy Dolphin</span> collection</h1>
                    <h4>A collection of 2D Generative Dolphin Arts</h4>
                    {isWalletConnected ? <>
                    <div className="header--btngroup">
                        <button className="btn-1" onClick={increment}>↑</button>
                        <button className="btn-1">{counter}</button>
                        <button className="btn-1" onClick={decrement}>↓</button>
                        <button className="mint--btn" onClick={mintCharacter}>{mintButtonText}</button>

                    </div> 
                    <a className='collection--link'
                        href={`https://opensea.io/assets?search[query]=${nftContractAddress}`}
                        target='_blank'
                    >
                        View Collection on Opensea
                    </a></>
                    : <h2 className="header--bg--white--text">  CONNECT YOUR METAMASK WALLET TO MINT </h2>}
                </div>
                
                <img src={Dolphins} alt="dolphin" className="header--dolphins-img" />

            </section>

        </>
    )
}

export default Header