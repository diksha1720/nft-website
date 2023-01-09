import React from "react"
import { useState, useEffect } from 'react'
import { nftContractAddress } from '../config.js'
import { BigNumber, ethers } from 'ethers'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faRotateRight } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { Oval } from 'react-loader-spinner'
import NFT from '../utils/DolphnNFT.json'


const Mint = () => {
    const [mintedNFT, setMintedNFT] = useState < undefined > (undefined)
    const [miningStatus, setMiningStatus] = useState < null > (null)
    const [loadingState, setLoadingState] = useState(0)
    const [txError, setTxError] = useState < null > (null)
    const [currentAccount, setCurrentAccount] = useState('')
    const [correctNetwork, setCorrectNetwork] = useState(false)
    const [counter, setCounter] = useState(1)

    // Checks if wallet is connected
    const checkIfWalletIsConnected = async () => {
        const { ethereum } = window
        if (ethereum) {
            console.log('Got the ethereum obejct: ', ethereum)
        } else {
            console.log('No Wallet found. Connect Wallet')
        }

        const accounts = await ethereum.request({ method: 'eth_accounts' })

        if (accounts.length !== 0) {

            console.log('Found authorized Account: ', accounts[0])
            setCurrentAccount(accounts[0])
        } else {
            console.log('No authorized account found')
        }
    }

    // Calls Metamask to connect wallet on clicking Connect Wallet button
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
        } catch (error) {
            let errordata = error.data ? error.data.message.split(":")[1] : error.message.split(":")[1]
            toast(errordata, {
                type: toast.TYPE.ERROR,
                draggable: true,
                autoClose: 5000,
            });
            console.log("Error:", errordata)

        }
    }


    // Checks if wallet is connected to the correct network
    const checkCorrectNetwork = async () => {
        const { ethereum } = window
        let chainId = await ethereum.request({ method: 'eth_chainId' })
        console.log('Connected to chain:' + chainId)

        const polygonChainId = '0x13881'

        const devChainId = 1337
        const localhostChainId = `0x${Number(devChainId).toString(16)}`

        if (chainId !== polygonChainId && chainId !== localhostChainId) {
            setCorrectNetwork(false)
        } else {
            setCorrectNetwork(true)
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected()
        checkCorrectNetwork()
    }, [])



    // }
    // Creates transaction to mint NFT on clicking Mint Character button
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

                const cost = await nftContract.cost()
                console.log(cost / 1E18)
                const costinEth = cost / 1E18
                console.log(num.counter)
                const totalCost = costinEth * num.counter
                // let nftTx = await nftContract.createRandomNFT({ value: ethers.utils.parseEther("0.03") })num

                let nftTx = await nftContract.createRandomNFT(BigNumber.from(num.counter), { value: ethers.utils.parseEther(String(totalCost)) })
                console.log('Mining....', nftTx.hash)
                setMiningStatus(0)

                let tx = await nftTx.wait()
                setLoadingState(1)
                console.log('Minted!', tx)

                // let event = tx.events[0]
                // console.log("event")
                // console.log(event)

                // let value = event.args[2]
                // console.log("VALUE")
                // console.log(value)
                // let tokenId = value.toNumber()

                let tokenId = await nftContract.totalSupply()
                console.log("Token Id is " + tokenId)
                console.log(
                    `Mined, see transaction: https://mumbai.polygonscan.com/tx/${nftTx.hash}`
                    // https://mumbai.polygonscan.com/address/0xF09d7016747D78B32FEF921Eeab41f2cfA5e8A7F
                )
                toast("NFT minted successfully", {
                    type: toast.TYPE.SUCCESS,
                    draggable: true,
                    autoClose: 5000,
                });
                setTimeout(function () {
                    window.location.reload();
                }, 60 * 1000);
                getMintedNFT(tokenId)

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




    // Gets the minted NFT data
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

    return (
        <div className='flex flex-col items-center pt-32 bg-[#c57fc7] text-[#360738] min-h-screen justify-items-center'>
            <div>
                <title>Dolphin NFT</title>
                <meta name='viewport' content='initial-scale=1.0, width=device-width' />

            </div>
            <div className='trasition hover:rotate-180 hover:scale-105 transition duration-500 ease-in-out '>
                <svg width="60%" height="60%" viewBox="0 0 64 64"
                    xmlns="http://www.w3.org/2000/svg"><g id="dolphin"
                        fill="#4e194f"
                        stroke="#000"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2">
                        <circle cx="54.5" cy="11.5" r="2.5" />
                        <circle cx="59.251" cy="19.232" r="1.069" />
                        <path d="M32.894,6.319c2.23-1.909,6.912-4.2,14.223.426,0,0-5.444.016-6.3,4.181" />
                        <path d="M33.711,46.766A4.99,4.99,0,0,1,32,43a5,5,0,0,1-10,0,5,5,0,0,1-10,0A5,5,0,0,1,2,43" />
                        <path d="M62,43a5,5,0,0,1-10,0,5,5,0,0,1-2.675,4.428" />
                        <path d="M15.224,28.46c1.512,2.181,4.381,3.811,9.805,2.716,0,0-4.328-1.667-4.457-5.225" />
                        <path d="M26.76,24.684C16.253,23.7,9.647,34.208,7.785,34.628c-2.182.491-2.433-2.661-1.954-4.6a12.194,12.194,0,0,0,.354-3.518S-4.746,20.718,5.9,10.986s32.961-8.341,40.284,7.889.8,25.949.8,25.949,5.837,5.561,2.948,13.088c0,0-5.974-11.261-18.332-7.1,0,0,.228-5.094,9.925-6.82,0,0,4.531-10.5-7.816-17.074" />
                        <circle cx="10.902" cy="22.007" r="1.5" />
                        <path d="M28.237,20.8S22.223,30.924,34.46,34.127c0,0-5.609-6.045,1.565-9.724" />
                        <path d="M13.173,10.723A20.2,20.2,0,0,1,24.081,8.266" /></g>
                </svg>
            </div>
            <h2 className='text-3xl font-bold mb-20 mt-12'>
                Mint your Dolphins NFT!
            </h2>
            {currentAccount === '' ? (
                <button
                    className='text-2xl text-[#c57fc7] font-bold py-3 px-12 bg-black shadow-lg shadow-[#d5abd6] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out'
                    onClick={connectWallet}
                >
                    Connect Wallet
                </button>
            ) : correctNetwork ? (
                <div >
                    <div className='flex flex-row'>
                        <button
                            className='text-2xl text-[#c57fc7] font-bold py-3 px-12 bg-black shadow-lg shadow-[#d5abd6] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out'
                            onClick={decrement}
                        >
                            -
                        </button>
                        <button
                            className='text-2xl text-[#c57fc7] font-bold py-3 px-5 bg-black shadow-lg shadow-[#d5abd6] rounded-lg mb-10 '
                            id="mintamount"
                        >
                            {counter}
                        </button>

                        <button
                            className='text-2xl text-[#c57fc7] font-bold py-3 px-12 bg-black shadow-lg shadow-[#d5abd6] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out'
                            onClick={increment}
                        >
                            +
                        </button>
                    </div>
                    <br></br>
                    <button
                        className='text-2xl text-[#c57fc7] font-bold py-3 px-12 bg-black shadow-lg shadow-[#d5abd6] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out'
                        onClick={mintCharacter}
                    >
                        Mint Characters
                    </button>



                </div>


            ) : (
                <div className='flex flex-col justify-center items-center mb-20 font-bold text-2xl gap-y-3'>
                    <div>----------------------------------------</div>
                    <div>Please connect to the Mumbai Testnet</div>
                    <div>and reload the page</div>
                    <div>----------------------------------------</div>
                </div>
            )}

            <div className='text-xl font-semibold mb-20 mt-4'>
                <a
                    href={`https://testnets.opensea.io/assets?search[query]=${nftContractAddress}`}
                    target='_blank'
                >
                    <span className='hover:underline hover:underline-offset-8 '>
                        View Collection on Opensea
                    </span>
                </a>
            </div>
            {loadingState === 0 ? (
                miningStatus === 0 ? (
                    txError === null ? (
                        <div className='flex flex-col justify-center items-center'>
                            <div className='text-lg font-bold'>
                                Processing your transaction
                            </div>

                            {/* <BallTriangle color="#1f1c1f" height={80} width={80} /> */}
                            {/* <Oval color="#1f1c1f" height={80} width={80} /> */}
                        </div>
                    ) : (
                        <div className='text-lg text-red-600 font-semibold'>{txError}</div>
                    )
                ) : (
                    <div></div>
                )
            ) : (
                <div className='flex flex-col justify-center items-center'>
                    {/* <button type="button" className='text-2xl text-[#1b181c] font-bold py-3' onClick={refreshPage}><FontAwesomeIcon icon={faRotateRight} />
          </button>
          <div className='font-semibold text-lg text-center mb-4'>
            Your Dolphin Character
          </div>
          <img
            src={`https://gateway.pinata.cloud/ipfs/${mintedNFT ? mintedNFT.split("//")[1] : "Undefined"}`}
            // https://gateway.pinata.cloud/ipfs/QmSmo354sjPzAfX5zTJA94MpbGpfF5v7APdVsQUQ53G4DE/Hidden.png
            alt=''
            className='h-60 w-60 rounded-lg shadow-2xl shadow-[#d5abd6] hover:scale-105 transition duration-500 ease-in-out'
          /> */}

                </div>
            )}
            <ToastContainer />
        </div>

    );
}


// function Mint1() {
//     return (
//         <h1>This is mint function</h1>
//     )
// }
export default Mint;



