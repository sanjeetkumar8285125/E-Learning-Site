const alertmsg=document.querySelector('.alert_msg')
if(alertmsg){
  setTimeout(()=>{
    alertmsg.remove()
  },5000)
}