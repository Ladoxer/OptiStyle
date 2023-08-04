// const errorHandler = (err,req,res,next)=>{
//   console.error(err.stack);
//   res.status(err.statusCode || 500);
//   res.json({
//     error: {
//       message: err.message || 'Internal Server Error'
//     }
//   });
// }


const error500 = (err,req,res,next) =>{
  res.status(500);

  // respond with HTML page for 500 errors
  if(req.accepts("html")){
    res.render("error/500",{error:err});
    return;
  }
}

const error502 = (err,req,res,next) =>{
  res.status(502);

  // respond with HTML page for 502 errors
  if(req.accepts("html")){
    res.render("error/502");
    return;
  }
}

const error404 = (req,res,next) =>{
  res.status(404);

  // respond with HTML page for 404 errors
  if(req.accepts("html")){
    res.render("error/404",{url:req.url});
    return;
  }
}

module.exports = {
  error404,
  error500,
  error502
}