import logo from './logo.svg';
import './App.css';
import Mint from './components/Mint'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import About from './components/About'
import Collect from './components/Collect';
import Header from './components/Header';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div>
      <Header />
      <About />
      <Collect />
      <Footer />
      <ToastContainer />
    </div>

  );
}

export default App;

