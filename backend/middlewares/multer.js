import multer from "multer"

const storage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, "./public")
    },
    filename:(req, file, cb) => {
        cb(null, file.originalname)
    },

})

export const upload = multer({storage})

// import multer from "multer";

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "public");   // backend/public folder me save hoga
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "-" + file.originalname);
//     },
// });

// export const upload = multer({ storage });
