const express = require('express');
const { 
	newOrder,
	getSingleOrder,
	getMyOrder,
	updateOrderStatus, 
	getAllOrder,
	deleteOrder
} = require('../controllers/orderController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth')

const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);
router.route("/order/me").post(isAuthenticatedUser, getMyOrder);
router.route("/admin/orders").post(isAuthenticatedUser, authorizeRoles('admin'), getAllOrder);
router.route("/admin/order/:id")
	.put(isAuthenticatedUser, authorizeRoles('admin'), updateOrderStatus)
	.delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router