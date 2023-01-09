import React from "react"
import '../App.css'
import { FaHeart } from "react-icons/fa";
import Dolphin1 from '../images/dolphin-1.png'
import Dolphin2 from '../images/dolphin-2.png'
function About() {
    return (
        <section className="about--section">
            <div className="about--text">
                <h4>About</h4>
                <h2>1000</h2>
                <h2>Crazy Dolphin NFTs</h2>
                <h3>United together on the Ethereum blockchain.</h3>
                <h3> A community inspired by the new generation of entrepreneurs and world travelers choosing to pursue a path of success through crypto and NFTs.</h3>
            </div>
            <div className="about--card">
                <img src={Dolphin1} alt="" className="card--img" />
                <span>Crazy Dolphin 1 <FaHeart className="heart--icon" /> </span>
            </div>
            <div className="about--card">
                <img src={Dolphin2} alt="" className="card--img" />
                <span >Crazy Dolphin 2 <FaHeart className="heart--icon" /> </span>
            </div>
        </section>
    )
}

export default About