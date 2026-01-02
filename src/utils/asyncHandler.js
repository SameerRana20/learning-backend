// // asyncHandlers using try catch
// const asyncHandler = (fn)=>{
//     return async(req ,res, next)=>{
//         try {
//             await fn(req, res , next)
//         }
//         catch(error) {
//             res.status(error.statusCode || 500).json({
//                 success: false,
//                 message : error.message
//             })
//         }
//     }
// }

//aysncHandler using promise
const asyncHandler= (fn)=>{
    return (req, res  , next)=>{
        Promise.resolve(fn(req, res ,next)) 
        .catch(next)  
    }
}

export {asyncHandler}