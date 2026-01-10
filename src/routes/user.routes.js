import { Router } from "express"
import {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updateUserInfo,
   updateUserAvatar,
   updateUserCoverImage } from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ])
    ,registerUser)

router.route("/login").post(loginUser)

router.route("/refresh").post(refreshAccessToken)

// -------------protected routes----------

router.use(verifyJWT)

router.route("/logout").post(logoutUser)

router.route("/change-password").post(changeCurrentPassword)

router.route("/me").get( getCurrentUser)

router.route("/profile").patch( updateUserInfo)

router.route("/avatar").patch(upload.single("avatar"),  updateUserAvatar)

router.route("/cover-image").patch(upload.single("coverImage"),  updateUserCoverImage)

export default router