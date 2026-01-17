//! This is a Delivery Assignment Card 
import React from 'react';
import { Store, User, Clock, Package } from 'lucide-react';

const DeliveryAssignmentCard = ({ assignment, accept, reject }) => {
  const {
    orderId,
    shopName,
    deliveryAddress,
    items,
    subtotal,
    paymentMethod,
    createdAt,
    userDetails,
    ownerDetails,
  } = assignment;

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 mb-6 group">
      {/* Header */}
      <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-2">
          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
            Order #{orderId.slice(-6)}
          </span>
          <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
            <Clock size={12} /> {formatTime(createdAt)}
          </span>
        </div>
        <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${paymentMethod === 'online' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'
          }`}>
          {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Paid'}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-6 relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-7 bottom-20 w-0.5 bg-gray-100 z-0"></div>

        {/* Pickup */}
        <div className="flex gap-4 relative z-10">
          <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 border-2 border-white shadow-sm shrink-0 mt-0.5">
            <Store size={14} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">{shopName}</h4>
            <p className="text-xs text-gray-400 mt-0.5">Restaurant Location</p>
            {ownerDetails?.mobile && (
              <p className="text-xs font-mono text-gray-400 mt-1">📞 {ownerDetails.mobile}</p>
            )}
          </div>
        </div>

        {/* Drop */}
        <div className="flex gap-4 relative z-10">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border-2 border-white shadow-sm shrink-0 mt-0.5">
            <User size={14} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">{userDetails?.fullName}</h4>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1" title={deliveryAddress?.text}>{deliveryAddress?.text}</p>
            {userDetails?.mobile && (
              <p className="text-xs font-mono text-gray-400 mt-1">📞 {userDetails.mobile}</p>
            )}
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="mx-5 mb-5 p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Package size={16} />
          <span className="text-xs font-bold">{items.length} Items</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400 block uppercase tracking-wider font-medium">Value</span>
          <span className="text-lg font-black text-gray-900">₹{subtotal}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => reject(assignment.assignmentId)}
          className="py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
          Reject
        </button>
        <button
          onClick={() => accept(assignment.assignmentId)}
          className="py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-green-600 transition-colors shadow-lg shadow-gray-200 hover:shadow-green-200 active:scale-95"
        >
          Accept Delivery
        </button>
      </div>
    </div>
  );
};

export default DeliveryAssignmentCard;
