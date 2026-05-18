// import { diskStorage } from "multer";
// // import { extname } from "path";
// export const multerConfig = {
//   storage: diskStorage({
//     destination: "./uploads",
//     filename: (req, file, callback) => {
//       const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//       file.originalname = file.originalname.replace(/\s+/g, "_");
//       callback(null, `${file.originalname}`);
//     },
//   }),
// };
import { memoryStorage } from "multer";

export const multerConfig = {
  storage: memoryStorage(),
};
