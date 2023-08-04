const isLogin = (req,res,next)=>{
  if(req.session.user_id){

  }else{
    res.redirect('/signin');
  }
  next();
}

const isLogout = (req,res,next)=>{
  if(req.session.user_id){
    res.redirect('/home');
  }
  next();
}

module.exports = {
  isLogin,
  isLogout
}