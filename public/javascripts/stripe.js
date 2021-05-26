function placeOrder(formObject){
   axios.post('/orders',formObject).then((res)=>{
Command: toastr["success"](res.data.message)
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "3000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "slideDown",
        "hideMethod": "slideUp"
      }
      setTimeout(()=>{
 window.location.href='/customers/orders'
      },2000);
     
        }).catch((err)=>{
          Command: toastr["error"](err.res.data.message)
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "3000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "slideDown",
        "hideMethod": "slideUp"
      }
        }) //end of catch
}

 function initStripe(){
       const stripe = Stripe('pk_test_51Isr7mSGYjYnomPV0wGMj6FSMzj5jb2z3w4DLOe5mZLpOCyIXIq4XKaO4JR4fcExpCk1XNqe82Q2Jjo61ZrXLviO00eBzOmM3o');
      let card=null;
  function mountwidget(){
    const elements=stripe.elements()
          let style = {
            base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4'
            }
            },
            invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
            }
        };
 
    card= elements.create('card',{ style,hidePostalCode:true })
    card.mount('#card-element')
  }

 const paymentType = document.querySelector('#paymentType');
paymentType.addEventListener('change',(e)=>{
console.log(e.target.value)
if(e.target.value === 'card'){
  mountwidget();
}
else{
  card.destroy();
}
  })


  const paymentForm = document.querySelector('#payment-form');
if(paymentForm)
 {
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let formData = new FormData(paymentForm);
        let formObject = {}
        for(let [key, value] of formData.entries()) {
            formObject[key] = value
        }

        if (!card)
        {
          placeOrder(formObject)
    console.log(formObject)
    return;
}

stripe.createToken(card).then((result)=>{
  formObject.stripeToken=result.token.id;
    placeOrder(formObject);
        console.log(formObject);
}).catch((err)=>{
  console.log(err);
})

})
}     //end of if(payment)
//verify card



      

}
 initStripe();