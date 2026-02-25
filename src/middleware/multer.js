import multer from "multer";
const storage= multer.memoryStorage();

const cabinUpload=multer({storage:storage}).single("cabinImage");

export default cabinUpload;