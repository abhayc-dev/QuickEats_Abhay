import User from "./models/user.model.js";

export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // When a user identifies themselves
    socket.on("identity", async ({ userId }) => {
      try {
        // Join a room with the userId for stable multi-tab messaging
        socket.join(userId);
        
        const user = await User.findByIdAndUpdate(
          userId,
          { socketId: socket.id, isOnline: true },
          { new: true }
        );
      } catch (error) {
        console.log(error);
      }
    });

    //! location update
    socket.on('updateLocation', async({latitude, longitude, userId}) => {
         try {
           const user = await User.findByIdAndUpdate(userId,{
                    location:{
                       type:'Point',
                       coordinates:[longitude, latitude]
                    },
                    isOnline: true,
                    socketId: socket.id,
                 })

                 if(user){
                     io.emit('updateDeliveryLocation', {
                      deliveryBoyId: userId,
                      latitude,
                      longitude
                     })
                 }
          
         } catch (error) {
               console.log('updateDeliveryLocation error')
         }
    })

    socket.on('disconnect', async() => {
        try {
              await User.findOneAndUpdate({socketId:socket.id} ,{
                  socketId: null,
                  isOnline: false,
              })
        } catch (error) {
             console.log(error)
        }
    })
  });
};
