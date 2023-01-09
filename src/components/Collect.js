import React from "react"
import '../App.css'
import { nftContractAddress } from '../config.js'

function Collect() {
    return (
        <section className="collect--section">

            <div className="collect--text">
                <h5>LET'S MAKE IT BIG</h5>
                <h1 className="collect--plain--text">Collect your favourite</h1>
                <span className="collect--bg--white--text">NFT Dolphin</span>
                <button className="collect--button" onClick=""><a href="#mint">COLLECT NOW</a></button>
            </div>
            <a className='collection--link'
                href={`https://testnets.opensea.io/assets?search[query]=${nftContractAddress}`}
                target='_blank'
            >
                View Collection on Opensea
            </a>

        </section>
    )
}

export default Collect