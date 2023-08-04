const isLogin = (req,res,next)=>{
  if(req.session.admin_id){

  }else{
    res.redirect('/admin');
  }
  next();
}

const isLogout = (req,res,next)=>{
  if(req.session.admin_id){
    res.redirect('/admin/dashboard');
  }
  next();
}

module.exports = {
  isLogin,
  isLogout
}