import './App.css';
import React from "react";
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WebFont from "webfontloader";
import Header from './component/layout/Header/Header';
import Footer from "./component/layout/Footer/Footer";
import Home from "./component/Home/Home";
import Search from "./component/Product/Search";
import ProductDetails from "./component/Product/ProductDetails";
import Products from "./component/Product/Products";

function App() {
	useEffect(() => {
		WebFont.load({
			google: {
				families: ["Roboto", "Droid Sans", "Chilanka"],
			},
		});
	}, []);

	return (
		<Router>
			<Header />
			<Routes>
				<Route exact path='/' element={<Home/>} />
        		<Route exact path="/product/:id" element={<ProductDetails/>} />
				<Route exact path="/products" element={<Products/>} />
				<Route path="/products/:keyword" element={<Products/>} />
				<Route exact path="/search" element={<Search/>} />
			</Routes>
     		<Footer />
		</Router>
	);
}

export default App;
