import React from "react"
import '../App.css'
import dolphinLogo from '../images/dolphin-logo.png'
import { FaInstagram } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function Navbar() {
    const [walletText, setWalletText] = useState("CONNECT WALLET")
    const [currentAccount, setCurrentAccount] = useState('')
    const connectWallet = async () => {
        try {
            const { ethereum } = window

            if (!ethereum) {
                console.log('Metamask not detected')
                return
            }
            let chainId = await ethereum.request({ method: 'eth_chainId' })
            console.log('Connected to chain:' + chainId)
            const polygonChainId = '0x13881'

            const devChainId = 1337
            const localhostChainId = `0x${Number(devChainId).toString(16)}`

            if (chainId !== polygonChainId && chainId !== localhostChainId) {
                alert('You are not connected to the Mumbai Testnet!')
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
            setWalletText("CONNECTED")
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


    return (
        <>
            <nav>
                <div className="nav--left">
                    <img src={dolphinLogo} alt="logo" className="nav--logo" />
                    <span>Crazy Dolphin</span>
                </div>
                <div className="nav--right">
                    <FaInstagram className="nav--icons" />
                    <FaTwitter className="nav--icons" />
                    <button className="nav--button" onClick={connectWallet}>{walletText}</button>
                </div>

            </nav>
            <ToastContainer />
        </>
    )
}

export default Navbar