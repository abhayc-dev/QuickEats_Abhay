//! This is a Delivery Assignment Card 

const DeliveryAssignmentCard = ({ assignment, accept }) => {
  const {
    // assignmentId,
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

   const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

  return (
    <div className="rounded-2xl shadow-md mb-4 border border-gray-200 overflow-hidden bg-[#FAF9F6]">

      {/* //! Header */}
      <div className="flex justify-between items-center border-b p-3 bg-amber-100 rounded-t-2xl">
        <div className="text-sm font-semibold text-gray-700">
          Order ID : {orderId.slice(0,6)}
        </div>
        <div className="text-xs text-gray-600 flex flex-col items-end font-bold">
            <div>
          ETD
            </div>
          <span className="font-bold text-gray-800">
            {formatTime(createdAt)} | {formatDate(createdAt)} 
           </span> 
        </div>
      </div>
      
      {/*  //! Add a new wrapper for the content and move padding here */}
      <div className="p-4">

        {/* //! Restaurant Details */}
        <div className="mb-3">
            <h3 className="font-semibold text-gray-700">Restaurant Details</h3>
            <p className="text-sm font-medium text-gray-600">{shopName}</p>
            <p className="text-xs text-gray-500">
            📍 {deliveryAddress?.text || "No Address"}
            </p>
            <p className="text-xs text-gray-500">📞 {ownerDetails?.mobile}</p>
        </div>

        {/* //! Customer Details */}
        <div className="mb-3">
            <h3 className="font-semibold text-gray-700">Customer Details</h3>
            <p className="text-sm text-gray-600">{userDetails?.fullName}</p>
            <p className="text-xs text-gray-500">
            📍 {deliveryAddress?.text || "No Address"}
            </p>
            <p className="text-xs text-gray-500">📞 {userDetails?.mobile}</p>
        </div>

        {/* //! Total Kms */}
        <div className="text-xs font-semibold text-gray-700 mb-2">
            Items : {items.length} | ₹ Subtotal : {subtotal}
        </div>

        {/* //! Payment Type */}
        <div className="text-xs font-semibold text-gray-700 mb-2">
            ₹ Payment Type :{" "}
            <span className="text-gray-600">{paymentMethod?.toUpperCase()}</span>
        </div>

        {/* //! Action Buttons */}
        <div className="flex justify-between mt-3">
            <button className="px-4 py-1 text-sm rounded-lg border border-gray-400 text-gray-600">
            Reject
            </button>
            <button className="px-4 py-1 text-sm rounded-lg bg-red-500 text-white shadow-md"
                onClick={() => accept(assignment.assignmentId)}
            >
            Accept
            </button>
        </div>
    </div>
</div>
  );
};

export default DeliveryAssignmentCard;
