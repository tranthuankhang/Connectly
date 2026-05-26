export const authMe = async (req, res) => {
   // return res.status(200).json({message: "User"});
   try {
    const user = req.user;
     return res.status(200).json({user});
   } catch (error) {
        console.error("Lỗi khi gọi authMe", error);
        return res.status(500).json({ message: "Lỗi máy chủ" });
   }
}