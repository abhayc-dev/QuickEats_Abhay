import React, { useEffect, useState } from "react";
import Nav from "../src/pages/Nav";
import Footer from "../src/pages/Footer";
import { Users, ShoppingBag, Store, DollarSign, Package } from "lucide-react";
import axios from "axios";
import { serverUrl } from "../src/config";

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [users, setUsers] = useState([]);
    const [shops, setShops] = useState([]);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/admin/dashboard-stats`, {
                withCredentials: true,
            });
            setStats(res.data);
        } catch (error) {
            console.error("Error fetching admin stats:", error);
        }
    };

    const fetchUsers = async () => {
        if (users.length > 0) return;
        try {
            const res = await axios.get(`${serverUrl}/api/admin/users`, {
                withCredentials: true,
            });
            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchShops = async () => {
        if (shops.length > 0) return;
        try {
            const res = await axios.get(`${serverUrl}/api/admin/shops`, {
                withCredentials: true,
            });
            setShops(res.data);
        } catch (error) {
            console.error("Error fetching shops:", error);
        }
    };

    const fetchOrders = async () => {
        if (orders.length > 0) return;
        try {
            const res = await axios.get(`${serverUrl}/api/admin/orders`, {
                withCredentials: true,
            });
            setOrders(res.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    useEffect(() => {
        if (activeTab === "users") fetchUsers();
        if (activeTab === "shops") fetchShops();
        if (activeTab === "orders") fetchOrders();
    }, [activeTab]);

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col">
            <Nav />
            <div className="flex-grow w-full max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <StatCard
                            title="Total Users"
                            value={stats.totalUsers}
                            icon={<Users size={24} className="text-blue-600" />}
                            color="bg-blue-100"
                        />
                        <StatCard
                            title="Total Shops"
                            value={stats.totalShops}
                            icon={<Store size={24} className="text-orange-600" />}
                            color="bg-orange-100"
                        />
                        <StatCard
                            title="Total Orders"
                            value={stats.totalOrders}
                            icon={<ShoppingBag size={24} className="text-green-600" />}
                            color="bg-green-100"
                        />
                        <StatCard
                            title="Total Revenue"
                            value={`₹${stats.totalRevenue}`}
                            icon={<DollarSign size={24} className="text-purple-600" />}
                            color="bg-purple-100"
                        />
                    </div>
                )}

                {/* Tabs */}
                <div className="flex space-x-4 border-b border-gray-200 mb-6">
                    <TabButton
                        active={activeTab === "dashboard"}
                        onClick={() => setActiveTab("dashboard")}
                    >
                        Dashboard
                    </TabButton>
                    <TabButton
                        active={activeTab === "users"}
                        onClick={() => setActiveTab("users")}
                    >
                        Users
                    </TabButton>
                    <TabButton
                        active={activeTab === "shops"}
                        onClick={() => setActiveTab("shops")}
                    >
                        Shops
                    </TabButton>
                    <TabButton
                        active={activeTab === "orders"}
                        onClick={() => setActiveTab("orders")}
                    >
                        Orders
                    </TabButton>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    {activeTab === "dashboard" && (
                        <div className="text-center py-10 text-gray-500">
                            <Package size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-lg">Welcome to the Admin Dashboard.</p>
                            <p>Select a tab to view detailed records.</p>
                        </div>
                    )}

                    {activeTab === "users" && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-500 text-sm uppercase">
                                        <th className="py-3 px-4">Name</th>
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Role</th>
                                        <th className="py-3 px-4">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium text-gray-900">{user.fullName}</td>
                                            <td className="py-3 px-4 text-gray-600">{user.email}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                        user.role === 'owner' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === "shops" && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-500 text-sm uppercase">
                                        <th className="py-3 px-4">Shop Name</th>
                                        <th className="py-3 px-4">Owner</th>
                                        <th className="py-3 px-4">Location</th>
                                        <th className="py-3 px-4">Items</th>
                                        <th className="py-3 px-4">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shops.map((shop) => (
                                        <tr key={shop._id} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium text-gray-900 flex items-center gap-2">
                                                <img src={shop.image} className="w-8 h-8 rounded-full object-cover" alt="" />
                                                {shop.name}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {shop.owner?.fullName || "N/A"}
                                                <br />
                                                <span className="text-xs text-gray-400">{shop.owner?.email}</span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{shop.city}, {shop.state}</td>
                                            <td className="py-3 px-4 text-gray-600">{shop.items?.length || 0}</td>
                                            <td className="py-3 px-4 text-gray-500">
                                                {new Date(shop.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === "orders" && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-500 text-sm uppercase">
                                        <th className="py-3 px-4">ID</th>
                                        <th className="py-3 px-4">User</th>
                                        <th className="py-3 px-4">Shop</th>
                                        <th className="py-3 px-4">Total</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-xs font-mono text-gray-500">
                                                {order._id.slice(-6).toUpperCase()}
                                            </td>
                                            <td className="py-3 px-4 font-medium text-gray-900">
                                                {order.userId?.fullName || "Guest"}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {order.shopId?.shopName || "Unknown Shop"}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-gray-900">₹{order.totalPrice}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            {icon}
        </div>
    </div>
);

const TabButton = ({ active, children, onClick }) => (
    <button
        onClick={onClick}
        className={`pb-3 px-1 font-medium text-sm transition-colors relative ${active ? "text-orange-600" : "text-gray-500 hover:text-gray-900"
            }`}
    >
        {children}
        {active && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-full"></span>
        )}
    </button>
);

export default AdminDashboard;
