import User from "../models/user.model.js";
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ message: "userId is not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "user is not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `get current user error ${error}` });
  }
};

//! logic to get lon & lat from user and find and update the coordinate
export const updateUserLocation = async(req, res) => {
    try {
        const {lat, lon} = req.body;
        const user = await User.findByIdAndUpdate(req.userId,{
            location:{
                type:'Point',
                coordinates:[lon, lat]
            }
        }, {new:true})

        if(!user){
            return res.status(400).json({message: "user not found"});
        }

        return res.status(200).json({message:"location updated"})

    } catch (error) {
    return res.status(500).json({ message: error.message }); // send readable error
}
}

//! store an Expo push token for this account, so it can be alerted (sound +
//! notification) even when its app is backgrounded or closed
export const registerPushToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "token is required" });
    }
    // addToSet avoids piling up duplicate entries if the same device
    // re-registers (e.g. on every app launch)
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $addToSet: { expoPushTokens: token } },
      { new: true }
    );
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    return res.status(200).json({ message: "push token registered" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
